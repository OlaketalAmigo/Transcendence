//////////////////////////////////////////////////////////////////////
// LEGAL NOTICE POPUP
function updateTime() {
    numberOfCatKilled++; secondPassed++;
    localStorage.setItem('kittenKilled', numberOfCatKilled);
    document.getElementById('timeCounter').textContent = numberOfCatKilled;
    if (secondPassed === 7)
    {show_popup();}
    if (numberOfCatKilled % 2 === 0)
    {
        document.documentElement.style.setProperty('--color1', 'rgb(190, 63, 40)');
        document.documentElement.style.setProperty('--color2', 'rgb(211, 187, 53)');}
    else
    {
        document.documentElement.style.setProperty('--color1', 'rgb(211, 187, 53)');
        document.documentElement.style.setProperty('--color2', 'rgb(190, 63, 40)');}
}

function show_popup() {
    var murderButton = document.getElementById('murderButton');
    murderButton.style.display = 'block';
}



let numberOfCatKilled = localStorage.getItem('kittenKilled');
let secondPassed = 0;
setInterval(updateTime, 1300);