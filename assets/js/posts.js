// Render beauty and fashion posts from JSON
async function loadPosts(type, containerId, jsonFile) {
  const res = await fetch(jsonFile);
  const posts = await res.json();
  const container = document.getElementById(containerId);
  container.innerHTML = posts.map(post => `
    <div class="post-card bg-white rounded-2xl shadow-lg overflow-hidden border border-soft-beige hover:shadow-2xl transition">
      <img src="${post.image}" alt="${post.title}" class="w-full h-40 object-cover object-center" />
      <div class="p-4">
        <span class="text-xs text-glossy-brown font-medium">${post.category}</span>
        <h3 class="text-lg font-semibold text-deep-black mt-1 mb-2">${post.title}</h3>
        <p class="text-gray-600 text-sm mb-2">${post.excerpt}</p>
        <div class="flex items-center justify-between text-xs text-gray-400">
          <span>${post.author}</span>
          <span>${new Date(post.date).toLocaleDateString()}</span>
        </div>
        <a href="${post.link}" class="inline-block mt-3 text-pop-pink font-semibold hover:underline">Read More &rarr;</a>
      </div>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('beauty-posts-grid')) {
    loadPosts('beauty', 'beauty-posts-grid', 'assets/data/beauty-posts.json');
  }
  if (document.getElementById('fashion-posts-grid')) {
    loadPosts('fashion', 'fashion-posts-grid', 'assets/data/fashion-posts.json');
  }
});
