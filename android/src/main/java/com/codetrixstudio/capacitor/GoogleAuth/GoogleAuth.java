package com.codetrixstudio.capacitor.GoogleAuth;

import android.content.Intent;
import androidx.activity.result.ActivityResult;

import com.codetrixstudio.capacitor.GoogleAuth.capacitorgoogleauth.R;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.common.api.Scope;
import com.google.android.gms.tasks.Task;

import org.json.JSONArray;
import org.json.JSONException;

@CapacitorPlugin()
public class GoogleAuth extends Plugin {
  private GoogleSignInClient googleSignInClient;

  @Override
  public void load() {
    String clientId = this.getContext().getString(R.string.server_client_id);
    boolean forceCodeForRefreshToken = false;

    Boolean forceRefreshToken = (Boolean) getConfigValue("forceCodeForRefreshToken");
    if (forceRefreshToken != null) {
      forceCodeForRefreshToken = forceRefreshToken;
    }

    GoogleSignInOptions.Builder googleSignInBuilder = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(clientId)
            .requestEmail();

    if (forceCodeForRefreshToken) {
      googleSignInBuilder.requestServerAuthCode(clientId, true);
    }

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
    startActivityForResult(call, signInIntent, "signInResult");
  }

  @ActivityCallback
  protected void signInResult(PluginCall call, ActivityResult result) {
    if (call == null) return;

    Task<GoogleSignInAccount> completedTask = GoogleSignIn.getSignedInAccountFromIntent(result.getData());

    try {
      GoogleSignInAccount account = completedTask.getResult(ApiException.class);

      JSObject authentication = new JSObject();
      authentication.put("idToken", account.getIdToken());

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

      call.resolve(user);
    } catch (ApiException e) {
      call.reject("Something went wrong", e);
    }
  }

  @PluginMethod()
  public void refresh(final PluginCall call) {
    call.reject("I don't know how to refresh token on Android");
  }

  @PluginMethod()
  public void signOut(final PluginCall call) {
    googleSignInClient.signOut();
    call.resolve();
  }
}
