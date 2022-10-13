import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, Http404, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required

from .models import *


def index(request):
    if request.user.is_authenticated:
        profile = Profile.objects.get(user=request.user)
        return render(request, "network/index.html", {
            "profile": profile
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
    elif section == "profile-section":
        posts = Post.objects.filter(user=request.user)
    elif section == "following-section":
        following = Follow.objects.get(follower=request.user).following.all()
        posts = Post.objects.filter(user__in=following) 
        return JsonResponse([following.serialize() for following in following], safe=False)
    else:
        return JsonResponse({"error": "Invalid page."}, status=400)

    posts = posts.order_by("-timestamp").all()
    return JsonResponse([post.serialize() for post in posts], safe=False, )

    

# edit profile 
@csrf_exempt
@login_required
def edit_profile(request):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)

    data = json.loads(request.body)
    if "avatar" not in data or "country" not in data or "age" not in data or "bio" not in data:
        return JsonResponse({"error": "Missing fields."}, status=400)

    profile = Profile.objects.get(user=request.user)
    profile.avatar = data["avatar"]
    profile.country = data["country"]
    profile.age = data["age"]
    profile.bio = data["bio"]
    profile.save()

    return JsonResponse({"message": "Profile updated successfully."}, status=201)

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

@login_required
def like_post(request, post_id):
    if request.method == "PUT":
        data = json.loads(request.body)
        user = request.user
        post = Post.objects.get(id=post_id)
        if user in post.likes.all():
            post.likes.remove(user)
        else:
            post.likes.add(user)
        post.save()
        return JsonResponse({"message": "Post liked successfully."}, status=201)
    return JsonResponse({"error": "PUT request required."}, status=400)

@login_required
def follow_user(request, username):
    if request.method == "PUT":
        data = json.loads(request.body)
        user = request.user
        profile = User.objects.get(username=username)
        if user in profile.followers.all():
            profile.followers.remove(user)
        else:
            profile.followers.add(user)
        profile.save()
        return JsonResponse({"message": "User followed successfully."}, status=201)
    return JsonResponse({"error": "PUT request required."}, status=400)


