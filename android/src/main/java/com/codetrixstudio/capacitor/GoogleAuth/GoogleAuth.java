package com.codetrixstudio.capacitor.GoogleAuth;

import android.accounts.Account;
import android.accounts.AccountManager;
import android.accounts.AccountManagerFuture;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;

import com.codetrixstudio.capacitor.GoogleAuth.capacitorgoogleauth.R;
import com.getcapacitor.JSObject;
import com.getcapacitor.NativePlugin;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.common.api.Scope;
import com.google.android.gms.tasks.Task;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

@NativePlugin(requestCodes = GoogleAuth.RC_SIGN_IN)
public class GoogleAuth extends Plugin {
  static final int RC_SIGN_IN = 1337;

  private final static String VERIFY_TOKEN_URL        = "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=";
  private final static String FIELD_TOKEN_EXPIRES_IN  = "expires_in";
  private final static String FIELD_ACCESS_TOKEN      = "accessToken";
  private final static String FIELD_TOKEN_EXPIRES     = "expires";
  public static final int KAssumeStaleTokenSec = 60;

  private GoogleSignInClient googleSignInClient;

  @Override
  public void load() {
    String clientId = this.getContext().getString(R.string.server_client_id);
    Boolean forceCodeForRefreshToken = false;

    Boolean forceRefreshToken = (Boolean) getConfigValue("forceCodeForRefreshToken");
    if (forceRefreshToken != null) {
      forceCodeForRefreshToken = forceRefreshToken;
    }

    GoogleSignInOptions.Builder googleSignInBuilder = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(clientId)
            .requestServerAuthCode(clientId, forceCodeForRefreshToken)
            .requestEmail();

    try {
      JSONArray scopeArray = (JSONArray) getConfigValue("scopes");
      Scope[] scopes = new Scope[scopeArray.length() - 1];
      Scope firstScope = new Scope(scopeArray.getString(0));
      for (int i = 1; i < scopeArray.length(); i++) {
        scopes[i - 1] = new Scope(scopeArray.getString(i));
      }
      googleSignInBuilder.requestScopes(firstScope, scopes);
    } catch (JSONException e) {
      e.printStackTrace();
    }

    GoogleSignInOptions googleSignInOptions = googleSignInBuilder.build();
    googleSignInClient = GoogleSignIn.getClient(this.getContext(), googleSignInOptions);
  }

  @PluginMethod()
  public void signIn(PluginCall call) {
    saveCall(call);
    Intent signInIntent = googleSignInClient.getSignInIntent();
    startActivityForResult(call, signInIntent, RC_SIGN_IN);
  }

  @Override
  protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
    super.handleOnActivityResult(requestCode, resultCode, data);

    if (requestCode == RC_SIGN_IN) {
      Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
      handleSignInResult(task);
    }
  }

  private void handleSignInResult(Task<GoogleSignInAccount> completedTask) {
    final PluginCall signInCall = getSavedCall();

    if (signInCall == null) return;

    try {

      final GoogleSignInAccount account = completedTask.getResult(ApiException.class);

      new AsyncTask<Void, Void, Void>() {
        @Override
        protected Void doInBackground(Void... params) {
          
          JSONObject result = new JSONObject();
          try {
            JSONObject accessTokenObject = getAuthToken(account.getAccount(), true);

            JSObject authentication = new JSObject();
            authentication.put("idToken", account.getIdToken());
            authentication.put(FIELD_ACCESS_TOKEN, accessTokenObject.get(FIELD_ACCESS_TOKEN));
            authentication.put(FIELD_TOKEN_EXPIRES, accessTokenObject.get(FIELD_TOKEN_EXPIRES));
            authentication.put(FIELD_TOKEN_EXPIRES_IN, accessTokenObject.get(FIELD_TOKEN_EXPIRES_IN));

            JSObject user = new JSObject();
            user.put("serverAuthCode", account.getServerAuthCode());
            user.put("idToken", account.getIdToken());
            user.put("authentication", authentication);

            user.put("displayName", account.getDisplayName());
            user.put("email", account.getEmail());
            user.put("familyName", account.getFamilyName());
            user.put("givenName", account.getGivenName());
            user.put("id", account.getId());
            user.put("imageUrl", account.getPhotoUrl());

            signInCall.success(user);
          } catch (Exception e) {
            e.printStackTrace();
            signInCall.error("Something went wrong when retrieve access token", e);
          }
          return null;
        }
      }.execute();

    } catch (ApiException e) {
      signInCall.error("Something went wrong", e);
    }
  }

  private JSONObject getAuthToken(Account account, boolean retry) throws Exception {
    AccountManager manager = AccountManager.get(getContext());
    AccountManagerFuture<Bundle> future = manager.getAuthToken (account, "oauth2:profile email", null, false, null, null);
    Bundle bundle = future.getResult();
    String authToken = bundle.getString(AccountManager.KEY_AUTHTOKEN);
    try {
      return verifyToken(authToken);
    } catch (IOException e) {
      if (retry) {
        manager.invalidateAuthToken("com.google", authToken);
        return getAuthToken(account, false);
      } else {
        throw e;
      }
    }
  }

  private JSONObject verifyToken(String authToken) throws IOException, JSONException {
    URL url = new URL(VERIFY_TOKEN_URL+authToken);
    HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();
    urlConnection.setInstanceFollowRedirects(true);
    String stringResponse = fromStream(
            new BufferedInputStream(urlConnection.getInputStream())
    );
        /* expecting:
        {
          "issued_to": "xxxxxx-xxxxxxxxxxxxxxx.apps.googleusercontent.com",
          "audience": "xxxxxx-xxxxxxxxxxxxxxxx.apps.googleusercontent.com",
          "user_id": "xxxxxxxxxxxxxxxxxxxx",
          "scope": "https://www.googleapis.com/auth/userinfo.email openid https://www.googleapis.com/auth/userinfo.profile",
          "expires_in": 3220,
          "email": "xxxxxxx@xxxxx.com",
          "verified_email": true,
          "access_type": "online"
         }
        */

    Log.d("AuthenticatedBackend", "token: " + authToken + ", verification: " + stringResponse);
    JSONObject jsonResponse = new JSONObject(
            stringResponse
    );
    int expires_in = jsonResponse.getInt(FIELD_TOKEN_EXPIRES_IN);
    if (expires_in < KAssumeStaleTokenSec) {
      throw new IOException("Auth token soon expiring.");
    }
    jsonResponse.put(FIELD_ACCESS_TOKEN, authToken);
    jsonResponse.put(FIELD_TOKEN_EXPIRES, expires_in + (System.currentTimeMillis()/1000));
    return jsonResponse;
  }

  public static String fromStream(InputStream is) throws IOException {
    BufferedReader reader = new BufferedReader(
            new InputStreamReader(is));
    StringBuilder sb = new StringBuilder();
    String line = null;
    while ((line = reader.readLine()) != null) {
      sb.append(line).append("\n");
    }
    reader.close();
    return sb.toString();
  }

  @PluginMethod()
  public void refresh(final PluginCall call) {
    call.error("I don't know how to refresh token on Android");
  }

  @PluginMethod()
  public void signOut(final PluginCall call) {
    googleSignInClient.signOut();
    call.success();
  }
}
