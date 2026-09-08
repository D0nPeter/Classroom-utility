const languageArray = ['pl', 'en', 'de', 'la'];
const flagPath = 'image/flags/flag_';

let languageScript;
let currentLang = -1;

window.languageChangedEvent = new Event("languageChanged");

window.addEventListener("load", initMain, false);

function initMain(){
    numChangeLanguage(languageArray.indexOf(getPreferredLanguage()));
}

function numChangeLanguage(btnNumber){
    if(btnNumber <= currentLang){
        btnNumber--;
    }
    currentLang = btnNumber;

    updateLanguageButtons();

    changeLanguage(languageArray[currentLang]);
}

function updateLanguageButtons(){
    let btnI = 1;
    for(let i=0; i<languageArray.length; i++){
        if(i == currentLang){
            document.getElementById("language_button").style.backgroundImage = `url('${flagPath + languageArray[i] + ".svg"}')`;
        }else{
            document.getElementById(`language_button_${btnI}`).style.backgroundImage = `url('${flagPath + languageArray[i] + ".svg"}')`;
            btnI++;
        }
    }
}

function changeLanguage(lang){
    localStorage.setItem("preferredLanguage", lang);

    loadLanguageScript(lang);

    dispatchEvent( window.languageChangedEvent );
}


function getPreferredLanguage(){
    return localStorage.getItem("preferredLanguage") || 'en';
}

function applyTranslation(translation){
    document.title = translation['title-main'];

    document.querySelectorAll('[data-i18n]').forEach( (element) => {
        const key = element.getAttribute("data-i18n");
        if(translation[key]){
            element.textContent = translation[key]; 
        }
    })

    document.querySelectorAll('[data-i18n-placeholder]').forEach( (element) => {
        const key = element.getAttribute("data-i18n-placeholder");
        if(translation[key]){
            element.placeholder = translation[key];
        }
    })
}

async function loadLanguageScript(lang){
    if(!lang){
        console.error("No language given for loading");
    }

    if(languageScript) {
        languageScript.remove();
    }

    languageScript = document.createElement('script');
    languageScript.id = 'languageScript';
    languageScript.src = `lang/${lang}.js`;

    languageScript.onload = () => {
        if(!window.translation){
            console.error('Translation file without translation for language ' + lang);
        }

        if(Object.keys(window.translation).lenght === 0){
            console.error('Empty translation provided for language ' + lang);
            return;
        }

        applyTranslation(window.translation);
    };

    document.head.appendChild(languageScript);
}