// ! GO BACK AND FORWARD NAVIGATION
window.onpopstate = function (event) {
  if (event.state) {
    if (event.state.section === "profile-section") {
      const username = window.location.href.split("/")[4];
      clear();
      showUserProfile(username);
    } else {
      clear();
      showSection(event.state.section);
    }
  }
};

// ! CLEAR THE PAGE
function clear() {
  try {
    document.querySelectorAll("#post").forEach((post) => {
      post.remove();
    });

    document
      .querySelector("#posts")
      .removeChild(document.querySelector("#empty-posts"));

    console.log("cleared");
    document.querySelector("#show-alert").innerHTML = "";
  } catch (error) {
    console.log(error);
  }
}

//  ! EVENT LISTENERS ON LOAD
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.onclick = () => {
      const section = link.dataset.section;
      clear();
      if (section === "profile-section") {
        const username = document.querySelector("#profile-username").innerHTML;
        showUserProfile(username);
        history.pushState({ section: section }, "", `#user/${username}`);
      } else {
        showSection(section);
        history.pushState({ section: section }, section, `/#${section}`);
      }
    };
  });

  document.querySelector("#new-post-form").onsubmit = post_button;
  document.querySelector("#edit-profile-form").onsubmit = edit_profile;

  refresh();
});

// ! REFRESH THE PAGE
function refresh() {
  const url = window.location.href;
  const section = url.split("#")[1];
  console.log("refreshed");
  if (section === undefined) {
    showSection("all-posts-section");
    history.pushState(
      { section: "all-posts-section" },
      "",
      "/#all-posts-section"
    );
  } else {
    if (section.includes("all-posts")) {
      showSection("all-posts-section");
    } else if (section.includes("following")) {
      showSection("following-section");
    } else if (section.includes("user/")) {
      const username = section.split("/")[1];
      showUserProfile(username);
    }
  }
}

// ? SHOW THE SECTION
function showSection(section) {
  try {
    if (section === "profile-section") {
      document.querySelector(`#${section}`).style.display = "block";
      document.querySelector("#posts").style.display = "block";

      document.querySelector("#all-posts-section").style.display = "none";
      document.querySelector("#following-section").style.display = "none";
      document.querySelector("#pagination").style.display = "none";
      document.querySelector("#new-post-section").style.display = "none";

      document.querySelector("#info-profile").innerHTML = `
      <button type="button" class="btn btn-outline-light btn-sm btn-block mb-2" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
      Edit Profile
      </button>
      `;
    } else if (section === "all-posts-section") {
      document.querySelector(`#${section}`).style.display = "block";
      document.querySelector("#new-post-section").style.display = "block";
      document.querySelector("#posts").style.display = "block";

      document.querySelector("#pagination").style.display = "none";
      document.querySelector("#profile-section").style.display = "none";
      document.querySelector("#following-section").style.display = "none";

      fetch_posts(section);
    } else if (section === "following-section") {
      document.querySelector(`#${section}`).style.display = "block";
      document.querySelector("#posts").style.display = "block";

      document.querySelector("#profile-section").style.display = "none";
      document.querySelector("#all-posts-section").style.display = "none";
      document.querySelector("#pagination").style.display = "none";
      document.querySelector("#new-post-section").style.display = "none";

      fetch_posts(section);
    }
  } catch (error) {
    console.log(error);
  }
}

//  ? SHOW USER PROFILE FROM POSTS
function showUser(username) {
  showUserProfile(username);
  history.pushState({ section: "profile-section" }, "", `#user/${username}`);
}

// ? SHOW USER PROFILE
function showUserProfile(username) {
  showSection("profile-section");
  let current_user = document.querySelector("#profile-username").innerHTML;
  console.log(current_user);

  fetch_profile(current_user, username).then((result) => {
    document.querySelector("#username-profile").innerHTML =
      result.username["user"];
    document.querySelector("#country-profile").innerHTML = `
      <i class="fas fa-map-marker-alt me-2"></i>${result.username.country}`;

    document.querySelector("#profile-avatar").src = result.username["avatar"];
    document.querySelector(
      "#profile-cover"
    ).style.backgroundImage = `url(${result.username.background_cover})`;

    document.querySelector("#num-posts").innerHTML = `
        <i class="fa-solid fa-book me-2"></i>${result.username.posts.length}
      `;

    document.querySelector("#num-followers").innerHTML = `
        <i class="fas fa-user me-2"></i>${result.username.followers}
      `;

    document.querySelector("#num-following").innerHTML = `
        <i class="fas fa-user me-2"></i>${result.username.following}
      `;

    document.querySelector("#profile-bio").innerHTML = `
        <p>Hi, I'm ${result.username.user}. I'm ${result.username.age} years old. I've joined this awesome social network at ${result.username.joined}</p>
        <p>${result.username.bio}</p>`;

    show_posts(result.username.posts, 1, 10);

    if (result.current_user.user === result.username.user) {
      document.querySelector("#info-profile").innerHTML = `
      <button type="button" class="btn btn-outline-light btn-sm btn-block mb-2" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
      Edit Profile
      </button>
      `;
    } else {
      if (result.current_user.following_list.includes(result.username.user)) {
        document.querySelector("#info-profile").innerHTML = `
        <button type="button" class="btn btn-outline-light btn-sm btn-block mb-2" onclick="follow_user('${result.username.user}')">
        Unfollow
        </button>
        `;
      } else {
        document.querySelector("#info-profile").innerHTML = `
      <button type="button" class="btn btn-outline-light btn-sm btn-block mb-2" onclick="follow_user('${result.username.user}')">
      Follow
      </button>
      `;
      }
    }
  });
}

// ? FETCH PROFILE
async function fetch_profile(current_user, username) {
  try {
    if (current_user !== username) {
      const current_user_response = await fetch(`/profile/${current_user}`);
      const username_response = await fetch(`/profile/${username}`);

      const current_user_data = await current_user_response.json();
      const username_data = await username_response.json();
      console.log(username_data);
      return {
        current_user: current_user_data,
        username: username_data,
      };
    } else {
      const current_user_response = await fetch(`/profile/${current_user}`);
      const current_user_data = await current_user_response.json();
      console.log(current_user_data);
      return {
        current_user: current_user_data,
        username: current_user_data,
      };
    }
  } catch (error) {
    console.log(error);
  }
}

// ? EDIT PROFILE
function edit_profile(event) {
  event.preventDefault();

  const avatar = document.querySelector("#avatar").value;
  const age = document.querySelector("#age").value;
  const bio = document.querySelector("#bio").value;
  const cover = document.querySelector("#background-cover").value;

  fetch("/edit-profile", {
    method: "Put",
    body: JSON.stringify({
      avatar: avatar,
      background_cover: cover,
      country: country,
      age: age,
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
      }
    });
}

// * SHOW POSTS
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
      ).innerHTML = ` <div class="row h-100" id="empty-posts">
      <div class="col-md-12 my-auto mt-5" >
          <img class="img-responsive center-block d-block mx-auto mb-2" id="empty" src="" alt="empty" width="10%">
          <h5 class="text-comment text-center"><strong>No posts yet</strong> 
            
          </h5>
      </div>
     </div>`;
      document.querySelector("#empty").src =
        "/static/network/assets/post-it.png";
    } else {
      posts_to_show.forEach((post) => {
        const post_div = document.createElement("div");
        post_div.setAttribute(
          "class",
          "post card mb-3 shadow border-0 rounded-0"
        );
        post_div.setAttribute("id", "post");
        post_div.innerHTML = `
          <div class="card-body">
            <div class="row justify-content-between">
              <div class="col-6 ">
                <a onclick="showUser('${post.user}')" data-username="${post.user}" class="d-flex inline-block"><img src="${post.user_avatar}" class="rounded-circle me-2" width="30" height="30"><h5 id="username" class="card-title">${post.user}</h5>
                </a>
              </div>
              <div class="col-6 text-end">
                <p class="card-text"><small class="text-muted">${post.timestamp}</small></p>
              </div>
            </div>
            <p class="card-text">${post.content}</p>

            <div class="row justify-content-between">
              <div id="like-comment-edit-delete" class="col">
              </div>
              <div class="col text-end">
                <p class="card-text"><small class="text-muted">${post.likes} people like this</small></p>
              </div>
            </div>
          
        </div>
      `;

        document.querySelector("#posts").append(post_div);
      });

      let current_user = document.querySelector("#profile-username").innerHTML;
      document.querySelectorAll("#like-comment-edit-delete").forEach((div) => {
        if (
          div.parentElement.parentElement.querySelector("#username")
            .innerHTML === current_user
        ) {
          div.innerHTML = `
          <a class="me-3" onclick="like_post('${div.parentElement.parentElement.parentElement.parentElement.id}')">
            <i class="fas fa-thumbs-up"></i> Like
          </a>
          <a class="me-3" onclick="comment_post('${div.parentElement.parentElement.parentElement.parentElement.id}')">
            <i class="fas fa-comment"></i> Comment
         </a>
          <a class="me-3" onclick="edit_post('${div.parentElement.parentElement.parentElement.parentElement.id}')">
            <i class="fas fa-edit"></i> Edit
          </a>
          <a class="me-3" onclick="delete_post('${div.parentElement.parentElement.parentElement.parentElement.id}')">
            <i class="fas fa-trash"></i> Delete
          </a>
          `;
        } else {
          div.innerHTML = `
          <a class="me-3" onclick="like_post('${div.parentElement.parentElement.parentElement.parentElement.id}')">
            <i class="fas fa-thumbs-up"></i> Like
          </a>
          <a class="me-3" onclick="comment_post('${div.parentElement.parentElement.parentElement.parentElement.id}')">
            <i class="fas fa-comment"></i> Comment
          </a>
          `;
        }
      });

      if (posts.length > posts_per_page) {
        document.querySelector("#pagination").style.display = "block";

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
      } else {
        document.querySelector("#pagination").style.display = "none";
      }
    }
  } catch (error) {
    console.log(error);
  }
}

// * FETCH POSTS
async function fetch_posts(name) {
  try {
    const response = await fetch(`/network/${name}`);
    const posts = await response.json();

    let page = 1;
    let posts_per_page = 10;

    show_posts(posts, page, posts_per_page);
  } catch (error) {
    console.log(error);
  }
}

// * NEW POST
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
      }
    })
    .catch((error) => {
      console.log("Error:", error);
    });
}

// * SEND A NEW POST
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

// ? FOLLOW A USER
function follow_user(username) {
  console.log(`Follow ${username}`);
  fetch(`/follow-user/${username}`, {
    method: "PUT",
  })
    .then((response) => response.json())
    .then((result) => {
      if ("error" in result) {
        document.querySelector("#show-alert").style.display = "block";
        document.querySelector("#show-alert").innerHTML = result["error"];
      } else if ("message" in result) {
        document.querySelector("#show-alert").style.display = "block";
        document.querySelector("#show-alert").innerHTML = result["message"];
        showUserProfile(username);
      }
    })
    .catch((error) => {
      console.log("Error:", error);
    });
}

// ? LIKE A POST
