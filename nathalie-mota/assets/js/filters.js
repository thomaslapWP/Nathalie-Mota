document.addEventListener('DOMContentLoaded', function () {
    let totalPhotos = 0;
    let loadedPhotos = 0;
    let loadingInProgress = false;
    let existingReferences = new Set(); // Ensemble pour stocker les références existantes

    // Chargement des photos
    function loadPhotos(resetFilters = false) {
        const category = document.getElementById('category-filter').value || '';
        const format = document.getElementById('format-filter').value || '';
        const order = document.getElementById('order-filter').value || 'DESC';

        const params = new URLSearchParams({
            action: 'filter_photos',
            category: category,
            format: format,
            order: order
        });

        console.log('Loading photos with params:', params.toString());

        fetch(`${nathalie_mota_ajax.url}?${params.toString()}`, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(responseData => {
            console.log('Photos loaded:', responseData);

            const photoList = document.getElementById('photo-list');

            if (resetFilters) {
                photoList.innerHTML = ''; // Réinitialiser la liste de photos si des filtres sont appliqués
                existingReferences.clear(); // Réinitialiser les références existantes
            }

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = responseData.html;

            tempDiv.querySelectorAll('.photo-item').forEach(photoItem => {
                const photoReference = photoItem.getAttribute('data-reference');
                if (!existingReferences.has(photoReference)) {
                    photoList.appendChild(photoItem); // Ajouter seulement les nouvelles photos
                    existingReferences.add(photoReference); // Ajouter la référence pour éviter les doublons
                }
            });

            totalPhotos = responseData.total;
            loadedPhotos = photoList.querySelectorAll('.photo-item').length;

            const loadMoreButton = document.getElementById('load-more');
            if (loadedPhotos < totalPhotos) {
                loadMoreButton.style.display = 'block';
            } else {
                loadMoreButton.style.display = 'none';
            }

            addLightboxEvents(); // Ré-attacher les événements de la lightbox si nécessaire
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
    // Bouton Charger plus
    document.getElementById('load-more').addEventListener('click', function () {
        if (loadingInProgress) return;
        loadingInProgress = true;

        const offset = loadedPhotos; // Utiliser loadedPhotos pour définir l'offset correct
        console.log('Load more clicked, current offset:', offset);

        const category = document.getElementById('category-filter').value || '';
        const format = document.getElementById('format-filter').value || '';
        const order = document.getElementById('order-filter').value || 'DESC';

        const params = new URLSearchParams({
            action: 'load_more_photos',
            offset: offset, // Passer l'offset correct ici
            category: category,
            format: format,
            order: order
        });

        console.log('Loading more photos with params:', params.toString());

        fetch(`${nathalie_mota_ajax.url}?${params.toString()}`, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(responseData => {
            console.log('More photos loaded:', responseData);

            const photoList = document.getElementById('photo-list');

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = responseData.html;

            tempDiv.querySelectorAll('.photo-item').forEach(photoItem => {
                const photoReference = photoItem.getAttribute('data-reference');
                if (!existingReferences.has(photoReference)) {
                    photoList.appendChild(photoItem); // Ajouter seulement les nouvelles photos
                    existingReferences.add(photoReference); // Ajouter la référence pour éviter les doublons
                }
            });

            loadedPhotos = photoList.querySelectorAll('.photo-item').length;

            if (loadedPhotos >= totalPhotos) {
                document.getElementById('load-more').style.display = 'none';
            } else {
                document.getElementById('load-more').style.display = 'block';
            }

            loadingInProgress = false;
            addLightboxEvents(); // Ré-attacher les événements de la lightbox si nécessaire
        })
        .catch(error => {
            console.error('Error:', error);
            loadingInProgress = false;
        });
    });

    document.getElementById('category-filter').addEventListener('change', () => loadPhotos(true));
    document.getElementById('format-filter').addEventListener('change', () => loadPhotos(true));
    document.getElementById('order-filter').addEventListener('change', () => loadPhotos(true));

    console.log('Initial load photos');
    loadPhotos(true);
    
    // Transformer les éléments <select> standards en menus déroulants personnalisés avec des options cliquables et stylisées
    const customSelects = document.getElementsByClassName("custom-select");
    Array.from(customSelects).forEach(customSelect => {
        const selectElement = customSelect.getElementsByTagName("select")[0];
        const selected = document.createElement("DIV");
        selected.setAttribute("class", "select-selected");
        selected.innerHTML = selectElement.options[selectElement.selectedIndex].innerHTML;
        customSelect.appendChild(selected);

        const optionsDiv = document.createElement("DIV");
        optionsDiv.setAttribute("class", "select-items select-hide");

        for (let j = 1; j < selectElement.length; j++) {
            const option = document.createElement("DIV");
            option.innerHTML = selectElement.options[j].innerHTML;
            option.addEventListener("click", function () {
                const select = this.parentNode.parentNode.getElementsByTagName("select")[0];
                const selectedDiv = this.parentNode.previousSibling;
                for (let i = 0; i < select.length; i++) {
                    if (select.options[i].innerHTML == this.innerHTML) {
                        select.selectedIndex = i;
                        selectedDiv.innerHTML = this.innerHTML;
                        const sameAsSelected = this.parentNode.getElementsByClassName("same-as-selected");
                        for (let k = 0; k < sameAsSelected.length; k++) {
                            sameAsSelected[k].removeAttribute("class");
                        }
                        this.setAttribute("class", "same-as-selected");
                        break;
                    }
                }
                selectedDiv.click();
                loadPhotos(true);
            });
            optionsDiv.appendChild(option);
        }
        customSelect.appendChild(optionsDiv);

        selected.addEventListener("click", function (e) {
            e.stopPropagation();
            closeAllSelect(this);
            this.nextSibling.classList.toggle("select-hide");
            this.classList.toggle("select-arrow-active");
        });
    });

    function closeAllSelect(elmnt) {
        const x = document.getElementsByClassName("select-items");
        const y = document.getElementsByClassName("select-selected");
        const arrNo = [];
        for (let i = 0; i < y.length; i++) {
            if (elmnt == y[i]) {
                arrNo.push(i);
            } else {
                y[i].classList.remove("select-arrow-active");
            }
        }
        for (let i = 0; i < x.length; i++) {
            if (!arrNo.includes(i)) {
                x[i].classList.add("select-hide");
            }
        }
    }
    console.log('Existing References:', Array.from(existingReferences)); // Log les références existantes

    document.addEventListener("click", closeAllSelect);
});
