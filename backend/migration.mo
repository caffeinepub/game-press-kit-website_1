import AccessControl "authorization/access-control";
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";

module {
  type GameDetails = {
    genre : Text;
    platforms : Text;
    releaseDate : Text;
  };

  type UserProfile = {
    name : Text;
  };

  type Actor = {
    accessControlState : AccessControl.AccessControlState;
    userProfiles : Map.Map<Principal, UserProfile>;
    gameDetails : GameDetails;
    passwordProtectionEnabled : Bool;
    password : Text;
    bodyTextColor : Text;
    aboutText : Text;
    featuresList : List.List<Text>;
    gameTitle : Text;
    taglineText : Text;
    instagramLink : Text;
    developerLink : Text;
    pressEmail : Text;
  };

  public func run(old : Actor) : Actor {
    // Reset the accessControlState to a fresh state so the next caller
    // to invoke initializeAdmin() becomes the new permanent admin.
    // All other CMS content is preserved as-is.
    {
      accessControlState = AccessControl.initState();
      userProfiles = old.userProfiles;
      gameDetails = old.gameDetails;
      passwordProtectionEnabled = old.passwordProtectionEnabled;
      password = old.password;
      bodyTextColor = old.bodyTextColor;
      aboutText = old.aboutText;
      featuresList = old.featuresList;
      gameTitle = old.gameTitle;
      taglineText = old.taglineText;
      instagramLink = old.instagramLink;
      developerLink = old.developerLink;
      pressEmail = old.pressEmail;
    };
  };
};
