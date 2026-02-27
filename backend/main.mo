import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  public type GameDetails = {
    genre : Text;
    platforms : Text;
    releaseDate : Text;
  };

  public type UpdateContentResult = {
    #success;
    #notAdmin;
  };

  public type AdminResult = {
    #success;
    #error : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  // Access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profiles
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Default game details
  var gameDetails : GameDetails = {
    genre = "Adventure";
    platforms = "PC, Console";
    releaseDate = "2024-12-01";
  };

  var passwordProtectionEnabled = false;
  var password : Text = "";

  var bodyTextColor : Text = "#000000";
  var aboutText : Text = "Welcome to our game!";
  let featuresList = List.empty<Text>();
  var gameTitle : Text = "Untitled Game";
  var taglineText : Text = "Best game ever!";

  var instagramLink : Text = "https://instagram.com/";
  var developerLink : Text = "https://developer.com/";
  var pressEmail : Text = "press@game.com";

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      return null;
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return;
    };
    userProfiles.add(caller, profile);
  };

  func takeFirstN(array : [Text], n : Nat) : [Text] {
    var result : [Text] = [];
    var count = 0;

    for (item in array.values()) {
      if (count >= n) {
        return result;
      };
      result := result.concat([item]);
      count += 1;
    };

    result;
  };

  public shared ({ caller }) func initializeAdmin(adminToken : Text, userProvidedToken : Text) : async AdminResult {
    if (caller.isAnonymous()) {
      return #error("Anonymous principals cannot become admin");
    };
    if (AccessControl.isAdmin(accessControlState, caller)) {
      return #error("Admin already initialized");
    };
    AccessControl.initialize(accessControlState, caller, adminToken, userProvidedToken);
    #success;
  };

  public query ({ caller }) func getAdminStatus() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public query ({ caller }) func isAdmin(principal : Principal) : async Bool {
    AccessControl.isAdmin(accessControlState, principal);
  };

  public shared ({ caller }) func enablePasswordProtection(password_ : Text) : async AdminResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #error("Unauthorized: Only admins can perform this action");
    };
    if (passwordProtectionEnabled) { return #error("Password protection already enabled") };

    password := password_;
    passwordProtectionEnabled := true;

    #success;
  };

  public shared ({ caller }) func disablePasswordProtection() : async AdminResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #error("Unauthorized: Only admins can perform this action");
    };
    if (not passwordProtectionEnabled) { return #error("Password protection already disabled") };

    password := "";
    passwordProtectionEnabled := false;
    #success;
  };

  public query func verifyPassword(password_ : Text) : async Bool {
    if (not passwordProtectionEnabled) { return true };
    password_ == password;
  };

  public shared ({ caller }) func updateAboutText(text : Text) : async UpdateContentResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #notAdmin;
    };
    aboutText := text;
    #success;
  };

  public shared ({ caller }) func updateFeatures(items : [Text]) : async UpdateContentResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #notAdmin;
    };

    let safeItems = takeFirstN(items, 4);

    for (item in safeItems.values()) {
      if (item.size() < 100) {
        featuresList.add(item);
      };
    };
    #success;
  };

  public shared ({ caller }) func updateGameDetails(genre : Text, platforms : Text, releaseDate : Text) : async UpdateContentResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #notAdmin;
    };
    gameDetails := {
      genre;
      platforms;
      releaseDate;
    };
    #success;
  };

  public shared ({ caller }) func updateInstagramLink(url : Text) : async UpdateContentResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #notAdmin;
    };
    instagramLink := url;
    #success;
  };

  public shared ({ caller }) func updateDeveloperLink(url : Text) : async UpdateContentResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #notAdmin;
    };
    developerLink := url;
    #success;
  };

  public shared ({ caller }) func updatePressEmail(email : Text) : async UpdateContentResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #notAdmin;
    };
    pressEmail := email;
    #success;
  };

  public shared ({ caller }) func updateBodyTextColor(color : Text) : async UpdateContentResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #notAdmin;
    };
    bodyTextColor := color;
    #success;
  };

  public shared ({ caller }) func updateGameTitle(title : Text) : async UpdateContentResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #notAdmin;
    };
    gameTitle := title;
    #success;
  };

  public shared ({ caller }) func updateTagline(newTagline : Text) : async UpdateContentResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #notAdmin;
    };
    taglineText := newTagline;
    #success;
  };

  public query func getAboutText() : async Text {
    aboutText;
  };

  public query func getFeatures() : async [Text] {
    featuresList.toArray();
  };

  public query func getGameDetails() : async GameDetails {
    gameDetails;
  };

  public query func getInstagramLink() : async Text {
    instagramLink;
  };

  public query func getDeveloperLink() : async Text {
    developerLink;
  };

  public query func getPressEmail() : async Text {
    pressEmail;
  };

  public query func getBodyTextColor() : async Text {
    bodyTextColor;
  };

  public query func getGameTitle() : async Text {
    gameTitle;
  };

  public query func getTagline() : async Text {
    taglineText;
  };
};
