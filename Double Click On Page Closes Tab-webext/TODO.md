* Detect tripple clicks?
https://stackoverflow.com/questions/6480060/how-do-i-listen-for-triple-clicks-in-javascript

window.addEventListener('click', function (evt) {
    if (evt.detail === 3) {
        alert('triple click!');
    }
});