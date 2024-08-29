function localStorageAvailable() {
    let storage;
    try {
        storage = window.localStorage;
        const x = "__storage_test__";
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return (
            e instanceof DOMException &&
            // everything except Firefox
            (e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === "QuotaExceededError" ||
                // Firefox
                e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage &&
            storage.length !== 0
        );
    }
}


export const localStorage = {
    setItem: (key: string, value: string) => {
        if (localStorageAvailable()) {
            window.localStorage.setItem(key, value);
        } else {
            console.error("localStorage is not available");
        }
    },
    getItem: (key: string) => {
        if (localStorageAvailable()) {
            return window.localStorage.getItem(key);
        } else {
            console.error("localStorage is not available");
            return null;
        }
    },
    removeItem: (key: string) => {
        if (localStorageAvailable()) {
            window.localStorage.removeItem(key);
        } else {
            console.error("localStorage is not available");
        }
    },
}