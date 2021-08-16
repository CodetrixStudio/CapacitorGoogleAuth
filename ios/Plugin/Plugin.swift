import Foundation
import Capacitor
import GoogleSignIn

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitor.ionicframework.com/docs/plugins/ios
 */
@objc(GoogleAuth)
public class GoogleAuth: CAPPlugin {
    var signInCall: CAPPluginCall!
    var googleSignIn: GIDSignIn!;
    var googleSignInConfiguration: GIDConfiguration!;
    var forceAuthCode: Bool = false;
    var scopes: [String]?;

    
    public override func load() {
        googleSignIn = GIDSignIn.sharedInstance;
        
        let clientId = getClientIdValue();
        let serverClientId = getServerClientIdValue();
        
        guard let clientId = clientId else {
            NSLog("no client id found in config")
            return;
        }

        googleSignInConfiguration = GIDConfiguration.init(clientID: clientId, serverClientID: serverClientId)

        scopes = getConfigValue("scopes") as? [String];
        
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
                self.googleSignIn.signIn(with: self.googleSignInConfiguration, presenting: self.bridge!.viewController!) {  user, error in
                    if let error = error {
                        self.signInCall?.reject(error.localizedDescription);
                        return;
                    }
                    self.processCallback(user: user!);
                };
            }
        }
    }

    @objc
    func refresh(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if self.googleSignIn.currentUser == nil {
                call.reject("User not logged in.");
                return
            }
            self.googleSignIn.currentUser!.authentication.do { (authentication, error) in
                guard let authentication = authentication else {
                    call.reject(error?.localizedDescription ?? "Something went wrong.");
                    return;
                }
                let authenticationData: [String: Any] = [
                    "accessToken": authentication.accessToken,
                    "idToken": authentication.idToken,
                    "refreshToken": authentication.refreshToken
                ]
                call.resolve(authenticationData);
            }
        }
    }

    @objc
    func signOut(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.googleSignIn.signOut();
        }
        call.resolve();
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
    
    
    func getClientIdValue() -> String? {
        if let clientId = getConfigValue("iosClientId") as? String {
            return clientId;
        }
        else if let clientId = getConfigValue("clientId") as? String {
            return clientId;
        }
        else if let path = Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist"),
                let dict = NSDictionary(contentsOfFile: path) as? [String: AnyObject],
                let clientId = dict["CLIENT_ID"] as? String {
            return clientId;
        }
        return nil;
    }
    
    func getServerClientIdValue() -> String? {
        if let serverClientId = getConfigValue("serverClientId") as? String {
            return serverClientId;
        }
        return nil;
    }

    func processCallback(user: GIDGoogleUser) {
        var userData: [String: Any] = [
            "authentication": [
                "accessToken": user.authentication.accessToken,
                "idToken": user.authentication.idToken,
                "refreshToken": user.authentication.refreshToken
            ],
            "serverAuthCode": user.serverAuthCode,
            "email": user.profile?.email,
            "familyName": user.profile?.familyName,
            "givenName": user.profile?.givenName,
            "id": user.userID,
            "name": user.profile?.name
        ];
        if let imageUrl = user.profile?.imageURL(withDimension: 100)?.absoluteString {
            userData["imageUrl"] = imageUrl;
        }
        signInCall?.resolve(userData);
    }
}
