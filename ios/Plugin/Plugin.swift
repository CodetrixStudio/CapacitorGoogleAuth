import Foundation
import Capacitor
import GoogleSignIn

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitor.ionicframework.com/docs/plugins/ios
 */
@objc(GoogleAuth)
public class GoogleAuth: CAPPlugin {
    var pluginCall: CAPPluginCall?
    
    public override func load() {
        guard let path = Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") else {return}
        guard let dict = NSDictionary(contentsOfFile: path) as? [String: AnyObject] else {return}
        guard let clientId = dict["CLIENT_ID"] as? String else {return}
        
        GIDSignIn.sharedInstance().clientID = clientId;
        GIDSignIn.sharedInstance().delegate = self;
        GIDSignIn.sharedInstance().uiDelegate = self;
        
        NotificationCenter.default.addObserver(self, selector: #selector(handleOpenUrl(_ :)), name: Notification.Name(CAPNotifications.URLOpen.name()), object: nil);
    }
    
    @objc
    func signIn(_ call: CAPPluginCall) {
        pluginCall = call;
        
        DispatchQueue.main.async {
            if GIDSignIn.sharedInstance().hasAuthInKeychain() {
                GIDSignIn.sharedInstance().signInSilently();
            } else {
                GIDSignIn.sharedInstance().signIn();
            }
        }
    }

    @objc
    func signOut(_ call: CAPPluginCall) {
        GIDSignIn.sharedInstance().signOut();
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
        GIDSignIn.sharedInstance().handle(url, sourceApplication: sourceApplication, annotation: [:]);
    }
    
    func processCallback(user: GIDGoogleUser) {
        pluginCall?.success([
            "authentication": [
                "accessToken": user.authentication.accessToken,
                "idToken": user.authentication.idToken,
                "refreshToken": user.authentication.refreshToken,
            ]
        ]);
    }
}

extension GoogleAuth: GIDSignInDelegate {
    public func sign(_ signIn: GIDSignIn!, didSignInFor user: GIDGoogleUser!, withError error: Error!) {
        if let error = error {
            pluginCall?.error(error.localizedDescription);
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
