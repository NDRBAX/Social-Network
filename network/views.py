import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import  HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required

from .models import *

def index(request):
    if request.user.is_authenticated:
        profile = Profile.objects.get(user=request.user)
        return render(request, "network/index.html", {
            "profile": profile,
        })
    else:
        return HttpResponseRedirect(reverse("login"))

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        
        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
            # create a new profile associated to this user
            profile = Profile.objects.create(user=user)
            profile.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@login_required
def section(request, section):
    if section == "all-posts-section":
        posts = Post.objects.all()
        comments = Comment.objects.all()
    elif section == "profile-section":
        posts = Post.objects.filter(user=request.user)
        comments = Comment.objects.all()
    elif section == "following-section":
        following = Profile.objects.get(user=request.user).following.all()
        posts = Post.objects.filter(user__in=following)
        comments = Comment.objects.all()
    else:
        return JsonResponse({"error": "Invalid page."}, status=400)

    posts = posts.order_by("-timestamp").all()
    liked_posts = Like.objects.filter(user=request.user).values_list("post", flat=True)
    comments = comments.order_by("-timestamp").all()

    return JsonResponse({
        "posts": [post.serialize() for post in posts],
        "liked": [liked_posts for liked_posts in liked_posts],
        "comments": [comment.serialize() for comment in comments],
        }, safe=False)

# edit profile 
@csrf_exempt
@login_required
def edit_profile(request):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)

    data = json.loads(request.body)

    if "avatar" not in data or "country" not in data or "age" not in data or "bio" not in data or "background_cover" not in data:
        return JsonResponse({"error": "Missing fields."}, status=400)

    print("covert", data["background_cover"])
  
    profile = Profile.objects.get(user=request.user)
    profile.avatar = data["avatar"]
    profile.background_cover = data["background_cover"]
    profile.country = data["country"]
    profile.age = data["age"]
    profile.bio = data["bio"]
    
    posts = Post.objects.filter(user=request.user)
    print(posts)
    for post in posts:
        post.user_avatar = data["avatar"]
        post.save()

    profile.save()

    return JsonResponse({"message": "Profile updated successfully."}, status=201)

# make a new post
@csrf_exempt
@login_required
def new_post(request):
    if request.method == "POST":
        data = json.loads(request.body)
        content = data.get("content", "")
        user = request.user
        avatar =Profile.objects.get(user=user).avatar
        print(avatar)
        if content == "":
            return JsonResponse({"error": "Content is required."}, status=400)
        else:
            post = Post(user=user, content=content, user_avatar=avatar)
            post.save()
            return JsonResponse({"message": "Post created successfully."}, status=201)
    else:
        return JsonResponse({"error": "POST request required."}, status=400)

# edit post
@csrf_exempt
@login_required
def edit_post(request, post_id):
    if request.method == "PUT":
        data = json.loads(request.body)
        content = data.get("content", "")
        post = Post.objects.get(id=post_id)
        post.content = content
        post.save()

        return JsonResponse({"message": "Post updated successfully."}, status=201)
    return JsonResponse({"error": "PUT request required."}, status=400)

# like a post
@csrf_exempt
@login_required
def like_post(request, post_id):
    if request.method == "PUT":
        user = request.user
        post = Post.objects.get(id=post_id)
        like = Like.objects.filter(user=user, post=post)

        if like:
            like.delete()
            post.likes = post.likes - 1
            post.save()
            return JsonResponse({"message": "Post unliked successfully."}, status=201)
        else:
            like = Like(user=user, post=post)
            like.save()
            post.likes = post.likes + 1
            post.save()

            return JsonResponse({"message": "Post liked successfully."}, status=201)
    return JsonResponse({"error": "PUT request required."}, status=400)

# follow an user
@csrf_exempt
@login_required
def follow_user(request, username):
    if request.method == "PUT":
        user = request.user
        profile = Profile.objects.get(user=user)
        user_to_follow = User.objects.get(username=username)
        if user_to_follow in profile.following.all():
            profile.following.remove(user_to_follow)
            profile.save()
            user_to_follow_profile = Profile.objects.get(user=user_to_follow)
            user_to_follow_profile.followers.remove(user)
            user_to_follow_profile.save()
            return JsonResponse ({"message": "Unfollowed successfully."}, status=201)
        else:
            profile.following.add(user_to_follow)
            profile.save()
            user_to_follow_profile = Profile.objects.get(user=user_to_follow)
            user_to_follow_profile.followers.add(user)
            user_to_follow_profile.save()
            return JsonResponse({"message": "User followed successfully."}, status=201)
    return JsonResponse({"error": "PUT request required."}, status=400)

# show user profile 
@login_required
def user_profile(request, username):
    if request.method == "GET":
        user = User.objects.get(username=username)
        profile = Profile.objects.get(user=user)
        posts = Post.objects.filter(user=user).all().order_by("-timestamp")
        liked_posts = Like.objects.filter(user=request.user).values_list("post", flat=True)
        comments = Comment.objects.all().order_by("-timestamp")

        return JsonResponse({
            "user": user.username,
            "comments": [comment.serialize() for comment in comments],
            "avatar": profile.avatar, 
            "background_cover": profile.background_cover, 
            "country": profile.country, 
            "age": profile.age, 
            "bio": profile.bio,
            "followers": profile.followers.count(),
            "following": profile.following.count(),
            "followers_list": [follower.username for follower in profile.followers.all()],
            "following_list": [following.username for following in profile.following.all()],
            "joined": user.date_joined.strftime(f"%b. %d, %Y, %I:%M %p"),
            "liked_posts": [liked_posts for liked_posts in liked_posts],
            "posts": [post.serialize() for post in posts]}, safe=False, status=201)

# new comment
@csrf_exempt
@login_required
def new_comment(request, post_id):
    if request.method == "POST":
        data = json.loads(request.body)
        content = data.get("content", "")
        user = request.user
        post = Post.objects.get(id=post_id)
        if content == "":
            return JsonResponse({"error": "Content is required."}, status=400)
        else:
            comment = Comment(user=user, post=post, content=content)
            comment.save()
            return JsonResponse({"message": "Comment created successfully."}, status=201)
    else:
        return JsonResponse({"error": "POST request required."}, status=400)

# delete post
@csrf_exempt
@login_required
def delete_post(request, post_id):
    if request.method == "DELETE":
        post = Post.objects.get(id=post_id)
        post.delete()
        return JsonResponse({"message": "Post deleted successfully."}, status=201)
    else:
        return JsonResponse({"error": "DELETE request required."}, status=400)