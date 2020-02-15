export interface User {
    id: string;
    email: string;
    
    name: string;
    familyName: string;
    givenName: string;
    imageUrl: string;

    serverAuthCode: string;
    authentication: Authentication;
}

export interface Authentication {
    accessToken: string;
    idToken: string;
}