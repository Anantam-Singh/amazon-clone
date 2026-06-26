const Product = require("../models/Product");

const seedProducts = async () => {
  try {
    // Check if products collection is empty
    const count = await Product.countDocuments();
    if (count === 0) {
      const defaultProducts = [
        {
          title: "iPhone 16",
          price: 79999,
          image: `${process.env.BACKEND_URL || "http://localhost:5000"}/images/iphone.jpg`,
          category: "Mobiles",
          description: "Latest Apple flagship smartphone featuring advanced camera controls, A18 chip, and improved battery life.",
          stock: 10,
        },
        {
          title: "Samsung S25",
          price: 69999,
          image: `${process.env.BACKEND_URL || "http://localhost:5000"}/images/samsung.jpg`,
          category: "Mobiles",
          description: "Premium Android flagship smartphone with Galaxy AI capabilities, a stunning dynamic AMOLED display, and triple lens cameras.",
          stock: 12,
        },
        {
          title: "MacBook Air",
          price: 99999,
          image: `${process.env.BACKEND_URL || "http://localhost:5000"}/images/macbook.jpg`,
          category: "Laptops",
          description: "Lightweight and powerful laptop powered by Apple M-series chips, featuring a fanless design, up to 18 hours of battery, and a brilliant Retina display.",
          stock: 8,
        },
        {
          title: "Boat Headphones",
          price: 2999,
          image: `${process.env.BACKEND_URL || "http://localhost:5000"}/images/boat.jpg`,
          category: "Audio",
          description: "Affordable over-ear wireless headphones with deep bass, comfortable ear pads, voice assistant support, and up to 15 hours of playback time.",
          stock: 15,
        },
      ];

      await Product.insertMany(defaultProducts);
      console.log("Database seeded successfully with default products!");
    } else {
      console.log("Database already contains product entries. Skipping seeding.");
    }
  } catch (error) {
    console.error("Database seeding failed:", error.message);
  }
};

module.exports = seedProducts;
