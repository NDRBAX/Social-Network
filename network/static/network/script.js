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
      location.reload();
      console.log("clicked");
      const section = link.dataset.section;
      if (section) {
        showSection(section);
        history.pushState({ section }, section, "#" + section);
      }
    };
  });

  document.querySelector("#new-post-form").onsubmit = post_button;

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

function show_posts(posts, page, posts_per_page) {
  try {
    let start = (page - 1) * posts_per_page;
    let end = page * posts_per_page;

    posts.slice(start, end).forEach((post) => {
      const post_element = document.createElement("div");
      post_element.setAttribute("id", "post");
      post_element.className = "card mb-2";

      const post_header = document.createElement("div");
      post_header.className = "card-header";
      post_header.innerHTML = post.user;
      post_element.appendChild(post_header);

      const post_body = document.createElement("div");
      post_body.className = "card-body";
      post_body.innerHTML = post.content;
      post_element.appendChild(post_body);

      const post_footer = document.createElement("div");
      post_footer.className = "card-footer";
      post_footer.innerHTML = post.timestamp;
      post_element.appendChild(post_footer);

      document.querySelector("#posts").append(post_element);
    });
  } catch (error) {
    console.log(error);
  }
}

async function fetch_posts(name) {
  if (name === "all-posts-section" || name === "profile-section") {
    document.querySelector("#new-post-section").style.display = "block";

    await fetch(`/network/${name}`)
      .then((response) => response.json())
      .then((posts) => {
        if (posts.length === 0) {
          document.querySelector(`#${name}`).innerHTML = "No posts to show";
        } else {
          let page = 1;
          let posts_per_page = 10;
          let total_pages = Math.ceil(posts.length / posts_per_page);

          document.querySelector(`#${name}`).innerHTML = `
            <div class="row mt-5">
                <div class="col-12">
                  <div id="posts"></div>
                </div>
              </div>
              <div class="row mt-5 mb-5">
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

          show_posts(posts, page, posts_per_page);

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
      });
  } else if (name === "following-section") {
    document.querySelector("#new-post-section").style.display = "none";
    await fetch(`/network/${name}`)
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
            li.innerHTML = user.posts;
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
