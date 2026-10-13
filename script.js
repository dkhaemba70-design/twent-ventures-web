const PROJECT_ID = "4wgqaq9o";
const DATASET = "production";

const query = `*[_type == "shoe"] | order(_createdAt desc) {
  name,
  price,
  category,
  inStock,
  "imageUrl": image.asset->url
}`;

const url =
  "https://" + PROJECT_ID + ".apicdn.sanity.io/v2025-10-07/data/query/" +
  DATASET + "?query=" + encodeURIComponent(query);

const grid = document.getElementById("productGrid");

fetch(url)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    grid.innerHTML = "";

    data.result.forEach(function (shoe) {
      const card = document.createElement("div");
      card.className = "product-card";

      const img = document.createElement("img");
      img.src = shoe.imageUrl || "";
      img.alt = shoe.name;

      const title = document.createElement("h3");
      title.textContent = shoe.name;

      const price = document.createElement("p");
      price.className = "price";
      price.textContent = "Ksh " + shoe.price;

      const status = document.createElement("p");
      status.textContent = shoe.inStock ? "In stock" : "Sold out";

      card.append(img, title, price, status);
      grid.appendChild(card);
    });
  })
  .catch(function (error) {
    grid.textContent = "Could not load shoes.";
    console.log(error);
  });