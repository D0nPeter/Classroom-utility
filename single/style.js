const path = '../themes/';
window.addEventListener("load", init, true);

function init(){
    changeTheme(getPreferredTheme());
}

function changeTheme(theme){
    document.getElementById("theme_link").href = path + theme + ".css";
}

function getPreferredTheme(){
    return localStorage.getItem("preferredTheme") || "froggy";
}

function setPreferredTheme(theme){
    localStorage.setItem("preferredTheme", theme);
}
