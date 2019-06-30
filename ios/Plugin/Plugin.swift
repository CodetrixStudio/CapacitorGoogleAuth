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
    
    public override func load() {
        guard let path = Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") else {return}
        guard let dict = NSDictionary(contentsOfFile: path) as? [String: AnyObject] else {return}
        guard let clientId = dict["CLIENT_ID"] as? String else {return}
        
        googleSignIn.clientID = clientId;
        googleSignIn.delegate = self;
        googleSignIn.uiDelegate = self;
        
        if let serverClientId = getConfigValue("serverClientId") as? String {
            googleSignIn.serverClientID = serverClientId;
        }
        
        if let scopes = getConfigValue("scopes") as? [String] {
            googleSignIn.scopes = scopes;
        }
        
        NotificationCenter.default.addObserver(self, selector: #selector(handleOpenUrl(_ :)), name: Notification.Name(CAPNotifications.URLOpen.name()), object: nil);
    }
    
    @objc
    func signIn(_ call: CAPPluginCall) {
        signInCall = call;
        
        DispatchQueue.main.async {
            if self.googleSignIn.hasAuthInKeychain() {
                self.googleSignIn.signInSilently();
            } else {
                self.googleSignIn.signIn();
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
        
        guard let options = object["options"] as? [UIApplication.OpenURLOptionsKey : Any] else {
            print("There is no options on handleOpenUrl");
            return;
        }
        
        let sourceApplication = options[UIApplication.OpenURLOptionsKey.sourceApplication] as? String;
        googleSignIn.handle(url, sourceApplication: sourceApplication, annotation: [:]);
    }
    
    func processCallback(user: GIDGoogleUser) {
        signInCall?.success([
            "authentication": [
                "accessToken": user.authentication.accessToken,
                "idToken": user.authentication.idToken,
                "refreshToken": user.authentication.refreshToken,
            ],
            "serverAuthCode": user.serverAuthCode,
            "email": user.profile.email,
            "familyName": user.profile.familyName,
            "givenName": user.profile.givenName,
            "id": user.userID,
            "imageUrl": user.profile.imageURL(withDimension: 100),
            "name": user.profile.name
        ]);
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

extension GoogleAuth: GIDSignInUIDelegate {
    public func sign(_ signIn: GIDSignIn!, present viewController: UIViewController!) {
        bridge.viewController.present(viewController, animated: true);
    }
    
    public func sign(_ signIn: GIDSignIn!, dismiss viewController: UIViewController!) {
        viewController.dismiss(animated: true);
    }
}
