let languageScript;

function getPreferredLanguage(){
    return localStorage.getItem("preferredLanguage") || 'en';
}

function changeLanguage(lang){
    localStorage.setItem("preferredLanguage", lang);

    loadLanguageScript(lang);
}

function applyTranslation(translation){
    document.title = translation['title-single'];

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
    languageScript.src = `../lang/${lang}.js`;

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