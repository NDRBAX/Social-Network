window.onpopstate = function (event) {
  if (event.state) {
    console.log(event.state.section);
    clear();
    showSection(event.state.section);
  }
};

function clear() {
  try {
    document.querySelectorAll("#post").forEach((post) => {
      post.remove();
    });
    console.log("cleared");
    document.querySelector("#show-alert").style.display = "none";
  } catch (error) {
    console.log(error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.onclick = () => {
      const section = link.dataset.section;
      showSection(section);
      history.pushState({ section: section }, section, `/#${section}`);
    };
  });

  document.querySelector("#new-post-form").onsubmit = post_button;
  document.querySelector("#edit-profile-form").onsubmit = edit_profile;

  refresh();
});

function refresh() {
  const url = window.location.href;
  console.log(url);
  const section = url.split("#")[1];
  console.log("refreshed");
  if (section === undefined) {
    showSection("all-posts-section");
  } else {
    if (section.includes("profile")) {
      showSection("profile-section");
    } else if (section.includes("all-posts")) {
      showSection("all-posts-section");
    } else if (section.includes("following")) {
      showSection("following-section");
    }
  }
}

// Show the section with the given name
function showSection(section) {
  try {
    if (section === "profile-section") {
      document.querySelector(`#${section}`).style.display = "block";
      document.querySelector("#all-posts-section").style.display = "none";
      document.querySelector("#following-section").style.display = "none";

      document.querySelector("#posts").style.display = "block";
      document.querySelector("#pagination").style.display = "block";
      document.querySelector("#new-post-section").style.display = "block";

      fetch_posts(section);
    } else if (section === "all-posts-section") {
      document.querySelector(`#${section}`).style.display = "block";
      document.querySelector("#profile-section").style.display = "none";
      document.querySelector("#following-section").style.display = "none";

      document.querySelector("#posts").style.display = "block";
      document.querySelector("#pagination").style.display = "block";
      document.querySelector("#new-post-section").style.display = "block";

      fetch_posts(section);
    } else if (section === "following-section") {
      document.querySelector(`#${section}`).style.display = "block";

      document.querySelector("#profile-section").style.display = "none";
      document.querySelector("#all-posts-section").style.display = "none";
      document.querySelector("#posts").style.display = "none";
      document.querySelector("#pagination").style.display = "none";
      document.querySelector("#new-post-section").style.display = "none";
    }
  } catch (error) {
    console.log(error);
  }
}

// show posts
function show_posts(posts, page, posts_per_page) {
  try {
    let total_pages = Math.ceil(posts.length / posts_per_page);
    let start = (page - 1) * posts_per_page;
    let end = start + posts_per_page;
    let posts_to_show = posts.slice(start, end);

    clear();

    if (posts.length === 0) {
      document.querySelector(
        "#posts"
      ).innerHTML = `<div class="alert alert-info" role="alert">No posts yet.</div>`;
    } else {
      posts_to_show.forEach((post) => {
        const post_div = document.createElement("div");
        post_div.setAttribute("class", "post card mb-3");
        post_div.setAttribute("id", "post");
        post_div.innerHTML = `
        <div class="card-body">
          <div class="row justify-content-between">
            <div class="col-6 d-flex inline-block">
              <img src="${post.user_avatar}" class="rounded-circle me-2" width="30" height="30">
              <h5 class="card-title">${post.user}</h5>
            </div>
            <div class="col-6 text-end">
              <p class="card-text"><small class="text-muted">${post.timestamp}</small></p>
            </div>
          </div>
          <p class="card-text">${post.content}</p>

          <div class="row justify-content-between">
            <div class="col">
              <a class="me-3" onclick="like_post('${post.id}')">
                <i class="fas fa-thumbs-up"></i> Like
              </a>
              <a class="me-3" onclick="unlike_post('${post.id}')">
                <i class="fas fa-thumbs-down"></i> Unlike
              </a>
              <a class="me-3"  onclick="edit_post('${post.id}')">
                <i class="fas fa-edit"></i> Edit
              </a>
              <a class="me-3"  onclick="delete_post('${post.id}')">
                <i class="fas fa-trash-alt"></i> Delete
              </a>
            </div>
            <div class="col text-end">
              <p class="card-text"><small class="text-muted">${post.likes} people like this</small></p>
            </div>
          </div>
        
      </div>
    `;
        document.querySelector("#posts").append(post_div);
      });

      document.querySelector(
        "#page-number"
      ).innerHTML = `${page} of ${total_pages}`;

      document.querySelector("#next").onclick = () => {
        if (page < total_pages) {
          page++;
          clear();
          show_posts(posts, page, posts_per_page);
          document.querySelector(
            "#page-number"
          ).innerHTML = `${page} of ${total_pages}`;
        }
      };

      document.querySelector("#previous").onclick = () => {
        if (page > 1) {
          page--;
          clear();
          show_posts(posts, page, posts_per_page);
          document.querySelector(
            "#page-number"
          ).innerHTML = `${page} of ${total_pages}`;
        }
      };
    }
  } catch (error) {
    console.log(error);
  }
}

async function fetch_posts(name) {
  try {
    const response = await fetch(`/network/${name}`);
    const posts = await response.json();
    console.log(posts);

    let page = 1;
    let posts_per_page = 10;

    show_posts(posts, page, posts_per_page);
  } catch (error) {
    console.log(error);
  }
}

// make a new post
function new_post(event) {
  event.preventDefault();

  const content = document.querySelector("#new-post-content").value;
  document.querySelector("#new-post-content").value = "";

  fetch("/new-post", {
    method: "POST",
    body: JSON.stringify({
      content: content,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      if ("error" in result) {
        document.querySelector("#show-alert").style.display = "block";
        document.querySelector("#show-alert").innerHTML = result["error"];
      } else if ("message" in result) {
        document.querySelector("#show-alert").style.display = "block";
        document.querySelector("#show-alert").innerHTML = result["message"];
        console.log(content);
      }
    });
}

// post button
function post_button(event, section) {
  new_post(event);
  clear();

  if (section === "profile-section") {
    showSection("profile-section");
  } else {
    showSection("all-posts-section");
  }
  history.pushState({ section }, section, section);
}

// edit profile via modal form
function edit_profile(event) {
  event.preventDefault();

  const username = document.querySelector("#username").value;
  const email = document.querySelector("#email").value;
  const avatar = document.querySelector("#avatar").value;
  const header_image = document.querySelector("#header-image").value;
  const bio = document.querySelector("#bio").value;

  fetch("/edit-profile", {
    method: "Put",
    body: JSON.stringify({
      username: username,
      email: email,
      avatar: avatar,
      header_image: header_image,
      bio: bio,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      if ("error" in result) {
        document.querySelector("#show-alert").style.display = "block";
        document.querySelector("#show-alert").innerHTML = result["error"];
      } else if ("message" in result) {
        document.querySelector("#show-alert").style.display = "block";
        document.querySelector("#show-alert").innerHTML = result["message"];
        console.log(result);
      }
    });
}
