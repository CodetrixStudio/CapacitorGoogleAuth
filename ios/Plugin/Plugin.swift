import Foundation
import Capacitor
import GoogleSignIn

public struct initConfig {
    var clientID: String?
    var serverClientID: String?
    var forceAuthCode: Bool?
    var scopes: [String]?
    var viewController: UIViewController = nil
}

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitor.ionicframework.com/docs/plugins/ios
 */
@objc(GoogleAuth)
public class GoogleAuth: CAPPlugin {
    var signInCall: CAPPluginCall?
    let googleSignIn = GIDSignIn.sharedInstance;
    var forceAuthCode: Bool = false;
    
    var signInConfig: GIDConfiguration
    var config = initConfig()
    

    public override func load() {
        guard let path = Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") else {
            print("GoogleService-Info.plist not found");
            return;
        }
        guard let dict = NSDictionary(contentsOfFile: path) as? [String: AnyObject] else {return}
        
        guard let clientId = dict["CLIENT_ID"] as? String else {return}
        
        config.clientID = clientId
        
        if let serverClientId = getConfigValue("serverClientId") as? String {
            config.serverClientID = serverClientId;
        }
        
        if let forceAuthCodeConfig = getConfigValue("forceCodeForRefreshToken") as? Bool {
            config.forceAuthCode = forceAuthCodeConfig;
        }
        
        if let scopes = getConfigValue("scopes") as? [String] {
            config.scopes = scopes;
        }
        
        if let viewController = bridge?.viewController {
            config.viewController = viewController
        }
     
        
        signInConfig = GIDConfiguration.init(
            clientID: clientId,
            serverClientID: config.serverClientID
            // TODO: scopes: config.scopes https://github.com/google/GoogleSignIn-iOS/pull/30
        )
        
        // googleSignIn.delegate = self;

        NotificationCenter.default.addObserver(self, selector: #selector(handleOpenUrl(_ :)), name: Notification.Name.capacitorOpenURL, object: nil);
    }

    @objc
    func signIn(_ call: CAPPluginCall) {
        signInCall = call;
        DispatchQueue.main.async {
            if self.googleSignIn.hasPreviousSignIn() && !self.forceAuthCode {
                self.googleSignIn.restorePreviousSignIn();
            } else {
                self.googleSignIn.signIn(
                    with: self.signInConfig,
                    presenting: self.config.viewController);
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
            self.googleSignIn.currentUser.authentication.getTokensWithHandler { (authentication, error) in
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
        signInCall?.resolve(userData);
    }
}

extension GoogleAuth: GIDSignInDelegate {
    public func sign(_ signIn: GIDSignIn!, didSignInFor user: GIDGoogleUser!, withError error: Error!) {
        if let error = error {
            signInCall?.reject(error.localizedDescription);
            return;
        }
        processCallback(user: user);
    }
}
