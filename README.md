#product editing template
{
id: "unique-id-" + Date.now(), // Auto-generate unique ID
name: "Product Name",
brand: "Brand Name",
price: 0.00,
originalPrice: 0.00,
rating: 0.0,
reviewCount: 0,
image: "assets/images/products/product-name.jpg",
category: "skincare", // skincare, makeup, haircare, tools
skinType: ["all"], // all, dry, oily, combination, sensitive
concerns: [], // acne, aging, hydration, brightening, etc.
affiliateUrl: "https://amazon.com/product?aff=YOUR-AFFILIATE-ID",
description: "Brief product description...",
onSale: false
}

# How to edit the blog post

How It Works:
Click any blog post in fashion.html → redirects to fashion-post.html?id=post-id
JavaScript loads the specific post content from blog-posts.json
Page updates with the correct title, content, author, images, etc.
SEO maintained with dynamic meta tags and structured data
✅ For Daily Posts:
To add a new post, simply:
Add a new entry to assets/data/blog-posts.json
Update the link in fashion.html to point to fashion-post.html?id=your-new-post-id
