import { STORAGE_KEYS } from '../../core/config.js';

export function checkIfLoggedIn() {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
        return true;
    }
    return false;
}
