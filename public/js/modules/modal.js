window.modal = {
    open(id) { document.getElementById(id).classList.add('active'); },
    close(id) { document.getElementById(id).classList.remove('active'); },
};
