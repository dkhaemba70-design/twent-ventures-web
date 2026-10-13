// ---------- Settings ----------
const PROJECT_ID = "4wgqaq9o";
const DATASET = "production";
const PAGE_SIZE = 6;     
const CURRENCY = "ksh ";    
const WHATSAPP_NUMBER = "254795641214";  

// ---------- Elements on the page ----------
const shopGrid = document.getElementById("shopGrid");
const shoeCount = document.getElementById("shoeCount");
const showingText = document.getElementById("showingText");
const loadMoreButton = document.getElementById("loadMore");
const filterButtons = document.getElementById("filterButtons");
const searchBox = document.getElementById("searchBox");
const sortSelect = document.getElementById("sortSelect");

// ---------- Data ----------
let allShoes = [];        
let filteredShoes = [];   
let visibleCount = PAGE_SIZE;
let activeCategory = "All";
let searchText = "";
let sortMode = "newest";

const query = `*[_type == "shoe"] | order(_createdAt desc) {
  _id,
  name,
  price,
  category,
  inStock,
  "imageUrl": image.asset->url
}`;

const url =
    "https://" + PROJECT_ID + ".apicdn.sanity.io/v2025-10-07/data/query/" +
    DATASET + "?query=" + encodeURIComponent(query);

// ---------- Build one card ----------
function createCard(shoe) {
    const card = document.createElement("div");
    card.className = "product-card";

    if (!shoe.inStock) {
        card.classList.add("sold-out");
    }

    if (shoe.imageUrl) {
        const img = document.createElement("img");
        img.src = shoe.imageUrl;
        img.alt = shoe.name;
        card.appendChild(img);
    }

    const title = document.createElement("h3");
    title.textContent = shoe.name;
    card.appendChild(title);

    const price = document.createElement("p");
    price.className = "price";
    price.textContent = CURRENCY + shoe.price;
    card.appendChild(price);

    if (shoe.inStock) {
        const orderButton = document.createElement("a");
        const message =
            "Hello, I would like to order the " + shoe.name +
            " (" + CURRENCY + shoe.price + "). Is it available?";

        orderButton.href =
            "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
        orderButton.target = "_blank";
        orderButton.rel = "noopener";
        orderButton.className = "secondary-btn";
        orderButton.textContent = "Order now";
        card.appendChild(orderButton);
    } else {
        const badge = document.createElement("span");
        badge.className = "sold-out-badge";
        badge.textContent = "Sold out";
        card.appendChild(badge);
    }

    return card;
}

// ---------- Show the shoes on the page ----------
function renderShoes() {
    shopGrid.innerHTML = "";

    if (filteredShoes.length === 0) {
        shopGrid.textContent = "No shoes found.";
        shoeCount.textContent = "0 shoes";
        showingText.textContent = "";
        loadMoreButton.style.display = "none";
        return;
    }

    const shoesToShow = filteredShoes.slice(0, visibleCount);

    shoesToShow.forEach(function (shoe) {
        shopGrid.appendChild(createCard(shoe));
    });

    shoeCount.textContent = filteredShoes.length + " shoes";
    showingText.textContent =
        "Showing " + shoesToShow.length + " of " + filteredShoes.length;

    if (visibleCount >= filteredShoes.length) {
        loadMoreButton.style.display = "none";
    } else {
        loadMoreButton.style.display = "block";
    }
}

// ---------- Filters ----------
function applyFilters() {
    filteredShoes = allShoes.filter(function (shoe) {
        const matchesCategory =
            activeCategory === "All" || shoe.category === activeCategory;

        const matchesSearch =
            shoe.name.toLowerCase().includes(searchText.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    if (sortMode === "low") {
        filteredShoes.sort(function (a, b) {
            return a.price - b.price;
        });
    } else if (sortMode === "high") {
        filteredShoes.sort(function (a, b) {
            return b.price - a.price;
        });
    }

    visibleCount = PAGE_SIZE;
    renderShoes();
}

filterButtons.addEventListener("click", function (event) {
    const clickedButton = event.target.closest(".filter-btn");

    if (!clickedButton) {
        return;
    }

    activeCategory = clickedButton.dataset.category;

    filterButtons.querySelectorAll(".filter-btn").forEach(function (button) {
        button.classList.remove("active");
    });
    clickedButton.classList.add("active");

    applyFilters();
});

// ---------- Search and sort ----------
searchBox.addEventListener("input", function () {
    searchText = searchBox.value.trim().slice(0, 50);
    applyFilters();
});

sortSelect.addEventListener("change", function () {
    sortMode = sortSelect.value;
    applyFilters();
});

// ---------- Load more button ----------
loadMoreButton.addEventListener("click", function () {
    visibleCount = visibleCount + PAGE_SIZE;
    renderShoes();
});

// ---------- Fetch the shoes from Sanity ----------
fetch(url)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        allShoes = data.result;
        applyFilters();
    })
    .catch(function (error) {
        shopGrid.textContent = "Could not load shoes.";
        console.log(error);
    });