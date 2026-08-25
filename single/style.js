window.currentTheme = "";
window.themeChangedEvent = new Event("themeChanged");

const path = '../themes/';

window.addEventListener("load", initStyle, false);

function initStyle(){
    changeTheme(getPreferredTheme());
}

function changeTheme(theme){
    setPreferredTheme(theme);

    document.getElementById("theme_link").href = path + theme + ".css";
    window.currentTheme = theme;

    dispatchEvent( window.themeChangedEvent );
}

function getPreferredTheme(){
    return localStorage.getItem("preferredTheme") || "froggy";
}

function setPreferredTheme(theme){
    localStorage.setItem("preferredTheme", theme);
}
