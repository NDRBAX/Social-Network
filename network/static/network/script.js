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
    document.querySelectorAll("#accordion-card").forEach((post) => {
      post.remove();
    });

    document.querySelector("#no-posts").innerHTML = "";

    console.log("cleared");
  } catch (error) {
    console.log(error);
  }
}

//  ! EVENT LISTENERS ON LOAD
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.onclick = () => {
      const section = link.dataset.section;
      document.querySelector("#characters-left").innerHTML = "";
      document.querySelector("#show-alert").innerHTML = "";
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

  document.querySelector("#new-post-form").onsubmit = new_post;
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

// ! DISPLAY THE CHARACTERS LEFT
function characters_left(textarea, display) {
  const max_length = 300;
  const characters_left = max_length - textarea.value.length;

  if (max_length === characters_left) {
    document.querySelector(`#${display}`).innerHTML = "";
  } else {
    document.querySelector(
      `#${display}`
    ).innerHTML = `<small><strong>${characters_left}</strong> characters left</small>`;
    if (characters_left < 50) {
      document.querySelector(`#${display}`).style.color = "red";
    } else if (characters_left < 100) {
      document.querySelector(`#${display}`).style.color = "orange";
    } else {
      document.querySelector(`#${display}`).style.color = "grey";
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

      fetch_posts(section, 1);
    } else if (section === "following-section") {
      document.querySelector(`#${section}`).style.display = "block";
      document.querySelector("#posts").style.display = "block";

      document.querySelector("#profile-section").style.display = "none";
      document.querySelector("#all-posts-section").style.display = "none";
      document.querySelector("#pagination").style.display = "none";
      document.querySelector("#new-post-section").style.display = "none";

      fetch_posts(section, 1);
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

    show_posts(
      result.username.posts,
      1,
      10,
      result.username.liked_posts,
      result.username.comments
    );

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

      return {
        current_user: current_user_data,
        username: username_data,
      };
    } else {
      const current_user_response = await fetch(`/profile/${current_user}`);
      const current_user_data = await current_user_response.json();
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
  const country = document.querySelector("#country").value;

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
        showError(result.error);
      } else if ("message" in result) {
        // hide modal after clicking on save
        const modal = document.getElementById("staticBackdrop");
        const modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();

        // update profile
        current_user = document.querySelector("#profile-username").innerHTML;
        showUserProfile(current_user);

        showAlert(result.message);
      }
    });
}

// * POSTS TEMPLATE
function show_posts(posts, page, posts_per_page, liked_posts, comments) {
  try {
    let total_pages = Math.ceil(posts.length / posts_per_page);
    let start = (page - 1) * posts_per_page;
    let end = start + posts_per_page;
    let posts_to_show = posts.slice(start, end);

    clear();

    if (posts.length === 0) {
      document.querySelector(
        "#no-posts"
      ).innerHTML = ` <div class="row h-100" id="empty-posts">
      <div class="col-md-12 my-auto mt-5" >
          <img class="img-responsive center-block d-block mx-auto mb-2" id="empty" src="" alt="empty" width="10%">
          <h5 class="text-comment text-center"><strong>No posts yet</strong></h5>
      </div>
     </div>`;
      document.querySelector("#empty").src =
        "/static/network/assets/post-it.png";
    } else {
      let current_user = document.querySelector("#profile-username").innerHTML;

      posts_to_show.forEach((post) => {
        const post_card = document.createElement("div");
        post_card.setAttribute("class", `accordion-item post-${post.id}`);
        post_card.setAttribute("id", "accordion-card");

        post_card.innerHTML = `<div class="accordion-header card mb-3 shadow border-0 rounded-0" id="flush-${post.id}">

          <div class="card-body">
              <div class="row justify-content-between">
                  <div class="col-6 ">
                      <a onclick="showUser('${post.user}')" data-username="${post.user}" class="d-flex inline-block">
                          <img src="${post.user_avatar}" class="rounded-circle me-2" width="30" height="30">
                          <h5 id="username" class="card-title">${post.user}</h5>
                      </a>
                  </div>
                  <div class="col-6 text-end">
                      <p class="card-text"><small class="text-muted">${post.timestamp}</small></p>
                  </div>
              </div>
      
              <div class="row justify-content-center mb-3">
                  <div class="col-11">
                      <p class="card-text mt-2">${post.content}</p>
                  </div>
              </div>
      
              <div id="like-comment-edit-delete" class="row justify-content-between align-items-center">
      
                  <div class="col-auto">
                      <a class="ms-2 me-3 position-relative col-4" onclick="like_post('${post.id}')">
                          <span id="like-${post.id}"></span>
                      </a>
                  </div>
      
                  <div class="col-auto text-start">
                      <a class="accordion-button collapsed col-8" id="button-comment-${post.id}" type="button" data-bs-toggle="collapse" data-bs-target="#data-collapse${post.id}" aria-expanded="false" aria-controls="accordion-${post.id}">
                          <i class="fas fa-reply me-2"></i> <small id="comments-count-${post.id}" class="text-secondary me-2">No comments</small>
                      </a>
                  </div>
      
                  <div id="edit-post" class="col text-end">
                  <div class="dropdown-start">
                  <button
                    class="btn btn-outline-secondary
                      btn-sm dropdown-toggle border-light"
                    type="button"
                    id="dropdownMenuButton1"
                    data-bs-toggle="dropdown"
                    aria-expanded="false">
                    <i class="fas fa-sliders-h"></i>
                  </button>
      
                  <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                    <li>
                      <a class="dropdown-item"  data-bs-toggle="modal" data-bs-target="#editPostBackdrop-${post.id}">
                        Edit post
                      </a>
                    </li>
      
                    <li>
                      <a class="dropdown-item" onclick="delete_post('${post.id}')">
                        Delete post
                      </a>
                    </li>
                  </ul>
                </div>
                  
                  </div>
      
                  <div class="modal modal-lg fade" id="editPostBackdrop-${post.id}" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="editPostBackdropLabel" aria-hidden="true">
                      <div class="modal-dialog modal-dialog-centered">
                          <div class="modal-content">
                              <div class="modal-header">
                                  <h1 class=" modal-title fs-5 " id="editPostBackdropLabel">Edit post</h1>
                                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                              </div>
      
                              <form id="edit-post-form-${post.id}">
                                  <div class="modal-body">
                                      <div class="mb-3">
                                          <textarea class="form-control border-0 shadow-none edit-post-content" id="edit-post-content-${post.id}" rows="4" maxlength="300" oninput="return characters_left(this, 'characters-left-edit-${post.id}')">${post.content}</textarea>
                                      </div>
                                  </div>
      
                                  <div class="modal-footer justify-content-between">
                                      
                                          <div class="col-4 text-start">
                                              <p class="  pb-0 mb-0" id="characters-left-edit-${post.id}"></p>
                                          </div>
                                          <div class="col-7 me-0 pe-1 text-end">
                                              <button type="button" class="btn btn-secondary me-1" data-bs-dismiss="modal">Close</button>
      
                                              <button onclick="edit_post('${post.id}')" class="btn btn-primary">Save</button>
                                          </div>
                                  </div>
                              </form>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      
      
      <div id="data-collapse${post.id}" class="accordion-collapse collapse" aria-labelledby="flush-${post.id}" data-bs-parent="#accordionPosts">
          <div class="accordion-body">
              <div id="comment" class="row">
                  <form id="comment-form">
                      <div class="form-group">
                          <textarea class="form-control border-0 new-comment-content shadow-none" rows="3" maxlength="300" placeholder="Leave a comment here" id="new-comment-${post.id}" oninput="return characters_left(this,'characters-left-comment-${post.id}')"></textarea>
                      </div>
                      <div class="row justify-content-end">
                          <div class="col ">
                              <p id="characters-left-comment-${post.id}" class="m-0 pt-3 ps-1"></p>
                          </div>
                          <div class="col-auto pe-3 me-1">
                              <button type="submit" onclick="new_comment(event, '${post.id}')" class="btn btn-outline-primary mt-2 mb-3 text-end">Post</button>
                          </div>
                      </div>
                  </form>
                  <div id="comments-${post.id}" class="mt-4"></div>
              </div>
          </div>
      </div>`;

        document.querySelector("#accordionPosts").append(post_card);

        // ! ADD STYLE TO LIKED POSTS BY CURRENT USER
        if (liked_posts.includes(post.id)) {
          document.querySelector(
            `#like-${post.id}`
          ).innerHTML = `<i class="fa-solid fa-heart text-danger me-2"></i><small class="text-secondary">${post.likes}</small>`;
        } else {
          document.querySelector(
            `#like-${post.id}`
          ).innerHTML = `<i class="fa-solid fa-heart text-secondary me-2"></i><small class="text-secondary">${post.likes}</small>`;
        }

        // ! ADD EDIT AND DELETE BUTTONS FOR CURRENT USER
        document.querySelectorAll("#accordion-card").forEach((element) => {
          if (element.querySelector("#username").innerHTML !== current_user) {
            element.querySelector("#edit-post").innerHTML = "";
          }
        });

        let comment_count = 0;

        // ! SHOW COMMENTS
        comments.forEach((comment) => {
          if (comment.post === post.id) {
            const comment_div = document.createElement("div");

            comment_div.setAttribute(
              "class",
              "card mb-3 shadow border-0 rounded-0"
            );

            comment_div.innerHTML = `
            <div class="card-body" id="comment-post">
              <div class="row justify-content-between">
                <div class="col-6">
                  <a onclick="showUser('${comment.user}')" data-username="${comment.user}" class="d-flex inline-block">
                    <img src="" class="rounded-circle me-2" width="30" height="30">
                    <h5 id="comment-username" class="card-title">${comment.user}</h5>
                  </a>
                </div>
                <div class="col-6 text-end">
                  <p class="card-text"><small class="text-muted">${comment.timestamp}</small></p>
                </div>
              </div>
              <div class="row justify-content-center mb-3">
                <div class="col-11">
                  <p class="card-text mt-2">${comment.content}</p>
                </div>
              </div>
            </div>`;

            document.querySelector(`#comments-${post.id}`).append(comment_div);

            const username =
              comment_div.querySelector("#comment-username").innerHTML;
            const request = fetch(`/profile/${username}`);
            const response = request.then((response) => response.json());
            response.then((data) => {
              comment_div.querySelector("img").src = data.avatar;
            });

            comment_count += 1;

            if (comment_count <= 1) {
              document.querySelector(
                `#comments-count-${post.id}`
              ).innerHTML = `${comment_count} comment`;
            } else if (comment_count > 1) {
              document.querySelector(
                `#comments-count-${post.id}`
              ).innerHTML = `${comment_count} comments`;
            }
          }
        });
      });

      // ! PAGINATION
      if (posts.length > posts_per_page) {
        document.querySelector("#pagination").style.display = "block";

        document.querySelector(
          "#page-number"
        ).innerHTML = `${page} of ${total_pages}`;

        document.querySelector("#next").onclick = () => {
          if (page < total_pages) {
            page++;
            clear();
            show_posts(posts, page, posts_per_page, liked_posts, comments);
            document.querySelector(
              "#page-number"
            ).innerHTML = `${page} of ${total_pages}`;
          }
        };

        document.querySelector("#previous").onclick = () => {
          if (page > 1) {
            page--;
            clear();
            show_posts(posts, page, posts_per_page, liked_posts, comments);
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

// * FETCH & SHOW POSTS
async function fetch_posts(section, page) {
  try {
    const request = await fetch(`/network/${section}`);
    const response = await request.json();

    let posts_per_page = 10;

    show_posts(
      response.posts,
      page,
      posts_per_page,
      response.liked,
      response.comments
    );
  } catch (error) {
    console.log(error);
  }
}

// * NEW POST
function new_post(event) {
  event.preventDefault();

  const content = document.querySelector("#new-post-content").value;
  document.querySelector("#new-post-content").value = "";

  const url = window.location.href;

  fetch("/new-post", {
    method: "POST",
    body: JSON.stringify({
      content: content,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      if ("error" in result) {
        showError(result.error);
      } else if ("message" in result) {
        document.querySelector("#characters-left").innerHTML = "";

        redirectAfterSuccess(url, result.message);
      }
    })
    .catch((error) => {
      console.log("Error:", error);
    });
}

// * NEW COMMENT
function new_comment(event, post_id) {
  event.preventDefault();

  const url = window.location.href;
  const content = document.querySelector(`#new-comment-${post_id}`).value;

  fetch(`/comments/${post_id}`, {
    method: "POST",
    body: JSON.stringify({
      content: content,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      if ("error" in result) {
        showError(result["error"]);
      } else if ("message" in result) {
        redirectAfterSuccess(url, result["message"]);
      }
    })
    .catch((error) => {
      console.log("Error:", error);
    });
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
        showError(result["error"]);
      } else if ("message" in result) {
        showAlert(result["message"]);
        showUserProfile(username);
      }
    })
    .catch((error) => {
      console.log("Error:", error);
    });
}

// ? LIKE A POST
function like_post(post_id) {
  const url = window.location.href;
  fetch(`/like-post/${post_id}`, {
    method: "PUT",
  })
    .then((response) => response.json())
    .then((result) => {
      if ("error" in result) {
        showError(result["error"]);
      } else if ("message" in result) {
        redirectAfterSuccess(url, result["message"]);
      }
    })
    .catch((error) => {
      console.log("Error:", error);
    });
}

// ? DELETE A POST
function delete_post(post_id) {
  const url = window.location.href;

  console.log(`Post ID ${post_id}`);
  fetch(`/delete-post/${post_id}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((result) => {
      if ("error" in result) {
        showError(result["error"]);
      } else if ("message" in result) {
        redirectAfterSuccess(url, result["message"]);
      }
    })
    .catch((error) => {
      console.log("Error:", error);
    });
}

// ? EDIT A POST
function edit_post(post_id) {
  let content = document.querySelector(`#edit-post-content-${post_id}`).value;
  const url = window.location.href;

  fetch(`/edit-post/${post_id}`, {
    method: "PUT",
    body: JSON.stringify({
      content: content,
    }),
  })
    .then((response) => response.json())
    .then((result) => {
      if ("error" in result) {
        showError(result["error"]);
      } else if ("message" in result) {
        const modal = document.getElementById(`editPostBackdrop-${post_id}`);
        const modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();

        redirectAfterSuccess(url, result["message"]);
      }
    })
    .catch((error) => {
      console.log("Error:", error);
    });
}

// ? SHOW ALERT
function showAlert(message) {
  document.querySelector("#show-alert").style.display = "block";

  setTimeout(() => {
    document.querySelector("#show-alert").style.display = "none";
  }, 4000);

  document.querySelector("#show-alert").innerHTML = `
  <div class="alert alert-success fade show" role="alert">
    <i class="fa-solid fa-circle-check me-2"></i>${message}
  </div>`;
}

// ? SHOW ERROR
function showError(message) {
  document.querySelector("#show-alert").style.display = "block";

  setTimeout(() => {
    document.querySelector("#show-alert").style.display = "none";
  }, 4000);

  document.querySelector("#show-alert").innerHTML = `
  <div class="alert alert-danger fade show" role="alert">
  <i class="fa-solid fa-triangle-exclamation me-2"></i>${message}
  </div>`;
}

// ? REDIRECT AFTER SUCCESS
function redirectAfterSuccess(url, message) {
  current_page = document
    .querySelector("#page-number")
    .innerHTML.split("of")[0];

  console.log(current_page);

  if (url.includes("all-posts")) {
    if (current_page) {
      fetch_posts("all-posts-section", current_page);
    } else {
      showSection("all-posts-section");
    }
  } else if (url.includes("user")) {
    showUserProfile(url.split("/").pop());
  } else if (url.includes("following")) {
    if (current_page) {
      fetch_posts("following-section", current_page);
    } else {
      showSection("following-section");
    }
  }
  showAlert(message);
}
