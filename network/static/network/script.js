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
  document.querySelectorAll("a").forEach((link) => {
    link.onclick = () => {
      clear();
      const section = link.dataset.section;
      showSection(section);
      history.pushState({ section }, section, "#" + section);
    };
  });

  document.querySelector("#new-post-form").onsubmit = post_button;

  refresh();
});

function refresh() {
  const url = window.location.href;
  const section = url.split("#")[1];

  if (!url.includes("#")) {
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
    let sections = [
      "profile-section",
      "following-section",
      "all-posts-section",
    ];

    sections.forEach((page) => {
      if (page !== section) {
        document.querySelector(`#${page}`).style.display = "none";
      } else {
        document.querySelector(`#${page}`).style.display = "block";
        fetch_posts(section);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

// Show posts
function show_posts(posts, page, posts_per_page, name) {
  try {
    const start = (page - 1) * posts_per_page;
    const end = start + posts_per_page;

    posts.slice(start, end).forEach((post) => {
      const post_div = document.createElement("div");
      post_div.className = "post";
      post_div.id = "post";

      // POST HEADER
      const post_header = document.createElement("div");
      post_header.className = "post-header";
      post_header.innerHTML = `<div class="post-user">${post.user}</div>
      <div class="post-timestamp">${post.timestamp}</div>`;
      post_div.append(post_header);

      // POST CONTENT
      const post_content = document.createElement("div");
      post_content.className = "post-content";
      post_content.innerHTML = `<div class="post-text">${post.content}</div>
      <hr>`;
      post_div.append(post_content);

      // // POST LIKES
      // const post_likes = document.createElement("div");
      // post_likes.className = "post-likes";
      // post_likes.innerHTML = `<div class="post-likes">${post.likes} likes</div>`;
      // post_div.append(post_likes);

      // // POST BUTTONS
      // const post_buttons = document.createElement("div");
      // post_buttons.className = "post-buttons";
      // post_buttons.innerHTML = `<button class="btn btn-primary" id="like-button" onclick="like_button('${post.id}')">Like</button>
      // <button class="btn btn-primary" id="edit-button" onclick="edit_button('${post.id}')">Edit</button>
      // <button class="btn btn-primary" id="delete-button" onclick="delete_button('${post.id}')">Delete</button>`;
      // post_div.append(post_buttons);

      // // POST EDIT
      // const post_edit = document.createElement("div");
      // post_edit.className = "post-edit";
      // post_edit.innerHTML = `<textarea class="form-control" id="edit-text" rows="3" placeholder="Edit your post here..."></textarea>
      // <button class="btn btn-primary" id="edit-button" onclick="edit_button('${post.id}')">Edit</button>`;
      // post_div.append(post_edit);

      document.querySelector("#posts").append(post_div);
    });
  } catch (error) {
    console.log(error);
  }
}

// fetch posts
function fetch_posts(name) {
  if (name === "all-posts-section" || name === "profile-section") {
    document.querySelector("#new-post-section").style.display = "block";

    fetch(`/network/${name}`)
      .then((response) => response.json())
      .then((posts) => {
        if (posts.length === 0) {
          document.querySelector(`#${name}`).innerHTML = "No posts to show";
        } else {
          document.querySelector(`#${name}`).innerHTML = `
          <div class="row">
            <div class="col-12">
              <div id="posts"></div>
            </div>
          </div>
          <div class="row">
            <div class="col-1">
              <button class="btn btn-primary" id="previous">Previous</button>
            </div>
            <div class="col-10 text-center">
              <p id="page-number"></p>
            </div>
            <div class="col-1">
              <button class="btn btn-primary" id="next">Next</button>
            </div>
          </div>`;

          let page = 1;
          let posts_per_page = 10;
          let number_of_pages = Math.ceil(posts.length / posts_per_page);

          show_posts(posts, page, posts_per_page, name);

          // show page number
          document.querySelector(
            "#page-number"
          ).innerHTML = `Page ${page} of ${number_of_pages}`;

          // next button
          document.querySelector("#next").onclick = () => {
            if (page < number_of_pages) {
              page += 1;
              document.querySelector("#posts").innerHTML = "";
              show_posts(posts, page, posts_per_page, name);
              document.querySelector(
                "#page-number"
              ).innerHTML = `Page ${page} of ${number_of_pages}`;
            }
          };

          // previous button
          document.querySelector("#previous").onclick = () => {
            if (page > 1) {
              page -= 1;
              document.querySelector("#posts").innerHTML = "";
              show_posts(posts, page, posts_per_page, name);
              document.querySelector(
                "#page-number"
              ).innerHTML = `Page ${page} of ${number_of_pages}`;
            }
          };
        }
      });
  } else if (name === "following-section") {
    document.querySelector("#new-post-section").style.display = "none";
    fetch(`/network/${name}`)
      .then((response) => response.json())
      .then((users) => {
        if (users.length === 0) {
          document.querySelector("#following-section").innerHTML =
            "No users to show";
        } else {
          users.forEach((user) => {
            const user_element = document.createElement("div");
            user_element.setAttribute("id", "user");

            const ul = document.createElement("ul");
            ul.className = "list-group page-list";
            user_element.appendChild(ul);

            const li = document.createElement("li");
            li.className = "list-group-item mb-1";
            li.innerHTML = user;
            ul.appendChild(li);

            document.querySelector(`#${name}`).append(user_element);
          });
        }
      });
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
