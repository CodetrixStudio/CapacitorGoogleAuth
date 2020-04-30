import Foundation
import Capacitor
import GoogleSignIn

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitor.ionicframework.com/docs/plugins/ios
 */
@objc(GoogleAuth)
public class GoogleAuth: CAPPlugin {
    var signInCall: CAPPluginCall?
    let googleSignIn: GIDSignIn = GIDSignIn.sharedInstance();
    var forceAuthCode: Bool = false;
    
    public override func load() {
        guard let path = Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") else {return}
        guard let dict = NSDictionary(contentsOfFile: path) as? [String: AnyObject] else {return}
        guard let clientId = dict["CLIENT_ID"] as? String else {return}
        googleSignIn.clientID = clientId;
        googleSignIn.delegate = self;
        googleSignIn.presentingViewController = bridge.viewController;
        if let serverClientId = getConfigValue("serverClientId") as? String {
            googleSignIn.serverClientID = serverClientId;
        }
        if let scopes = getConfigValue("scopes") as? [String] {
            googleSignIn.scopes = scopes;
        }
        if let forceAuthCodeConfig = getConfigValue("forceCodeForRefreshToken") as? Bool {
            forceAuthCode = forceAuthCodeConfig;
        }
        NotificationCenter.default.addObserver(self, selector: #selector(handleOpenUrl(_ :)), name: Notification.Name(CAPNotifications.URLOpen.name()), object: nil);
    }
    
    @objc
    func signIn(_ call: CAPPluginCall) {
        signInCall = call;
        DispatchQueue.main.async {
            if self.googleSignIn.hasPreviousSignIn() && !self.forceAuthCode {
                self.googleSignIn.restorePreviousSignIn();
            } else {
                self.googleSignIn.signIn();
            }
        }
    }
    
    @objc
    func refresh(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if self.googleSignIn.currentUser == nil {
                call.error("User not logged in.");
                return
            }
            self.googleSignIn.currentUser.authentication.getTokensWithHandler { (authentication, error) in
                guard let authentication = authentication else {
                    call.error(error?.localizedDescription ?? "Something went wrong.");
                    return;
                }
                let authenticationData: [String: Any] = [
                    "accessToken": authentication.accessToken,
                    "idToken": authentication.idToken,
                    "refreshToken": authentication.refreshToken
                ]
                call.success(authenticationData);
            }
        }
    }
    
    @objc
    func signOut(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.googleSignIn.signOut();
        }
        call.success();
    }
    
    @objc
    func handleOpenUrl(_ notification: Notification) {
        guard let object = notification.object as? [String: Any] else {
            print("There is no object on handleOpenUrl");
            return;
        }
        guard let url = object["url"] as? URL else {
            print("There is no url on handleOpenUrl");
            return;
        }
        googleSignIn.handle(url);
    }
    
    func processCallback(user: GIDGoogleUser) {
        var userData: [String: Any] = [
            "authentication": [
                "accessToken": user.authentication.accessToken,
                "idToken": user.authentication.idToken,
                "refreshToken": user.authentication.refreshToken
            ],
            "serverAuthCode": user.serverAuthCode,
            "email": user.profile.email,
            "familyName": user.profile.familyName,
            "givenName": user.profile.givenName,
            "id": user.userID,
            "name": user.profile.name
        ];
        if let imageUrl = user.profile.imageURL(withDimension: 100)?.absoluteString {
            userData["imageUrl"] = imageUrl;
        }
        signInCall?.success(userData);
    }
}

extension GoogleAuth: GIDSignInDelegate {
    public func sign(_ signIn: GIDSignIn!, didSignInFor user: GIDGoogleUser!, withError error: Error!) {
        if let error = error {
            signInCall?.error(error.localizedDescription);
            return;
        }
        processCallback(user: user);
    }
}
