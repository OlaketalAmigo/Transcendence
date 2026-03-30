
//////////////////////////////////////////////////////////////////////
// INDEX MAIN LOGIN
async function storeValue() {
    storedLogin = document.getElementById('loginInput').value;
    document.getElementById('loginInput').value = '';
    var status = await checkStatus();
    if (status === false) {
        chaberu('Please, who do you think we are?\nWe already know all about you.\nNow enter your correct login and nobody gets hurt', 'popup-chaberu');
        document.getElementById('loginInput').placeholder = `enter your 42 login`;
        storedLogin = '';
    }
    else {
        document.getElementById('loginInput').placeholder = `Welcome ${storedLogin}!`;
        document.getElementById('header1').textContent = `Let's talk a bit, ${logUser.firstName}.`;

        localStorage.setItem('storedLogin', storedLogin);
    }
}

// async function checkStatus() {
// 	// fetch_url = `http://localhost:8081/proxy/profile/${storedLogin}`;
// 	fetch_url = `http://localhost:9999/webcat.com/login/login_script.php?login=${encodeURIComponent(storedLogin)}`;
//     try {
//         const response = await fetch(fetch_url);
//         const statusCode = response.status;
//         if (response.status !== 200) {
//             throw new Error('Unvalid User');
//         }
//         else {
//             const jsonData = await response.json();
//             logUser = {
//                 firstName: jsonData.usual_first_name ?? jsonData.first_name,
//                 lastName: jsonData.last_name,
//                 photo: jsonData.image.link,
//                 month: jsonData.pool_month,
//                 year: jsonData.pool_year,
//                 projects: jsonData.projects_users.filter(project => project.status === "in_progress").map(project => project.project.name),
//                 perfect: jsonData.projects_users.filter(project => project.final_mark === 125).map(project => project.project.name),
//                 bh: Math.floor((new Date(jsonData.cursus_users[1].blackholed_at) - new Date()) / 86400000)
//             };
//             discussion = [
//                 `Welcome ${logUser.firstName} ${logUser.lastName}.`,
//                 `We heard quite a lot about the piscine of ${logUser.month} ${logUser.year}...\nIt's suprising to see you here`,
//                 `How is your ${logUser.projects[Math.floor(Math.random() * logUser.projects.length)]} coming along?`,
//                 `Perfect score for ${logUser.perfect[Math.floor(Math.random() * logUser.perfect.length)]}, impressive.. Should you really spend so much time in front of a screen?`,
//                 `Your BH is in ${logUser.bh} days... A cat wouldn't take that much time.`,
//                 `Shouldn't you be working on your ${logUser.projects[Math.floor(Math.random() * logUser.projects.length)]}?`,
//                 `Quite an ugly human...\n but then again, you arent a cat`
//             ]
//             index_wiskas = 0;
//             return true;
//         }
//     } catch (error) {
//         return false;
//     }
// }

function talkWiskas() {
    if (index_wiskas > 6) return ;
    document.getElementById('popup-chaberu').textContent = '';
    chaberu(discussion[index_wiskas], 'popup-chaberu');
    if (index_wiskas === 6) {
        document.getElementById('header1').textContent = `Time to end this, I have other cats to see.\nEnjoy this place.`;
        document.getElementById('backgroundpicture').src = logUser.photo;
    }
}

function chaberu(str, id, index = 0) {
    if (chaberuka) return ;
    const chaberuu = () => {
        if (index < str.length) {
            chaberuka = true;
            document.getElementById(id).textContent += str[index];
            index++;
            setTimeout(() => {
                chaberuu(str, id, index);
            }, 20);
        }
        else {
            setTimeout(() => {
                document.getElementById(id).textContent = '';
                chaberuka = false;
                index_wiskas++;
            }, 2000);
        }
    }
    chaberuu();
}
