from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Profile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="profile")
    background_cover = models.CharField(max_length=1000, default="https://images.unsplash.com/photo-1664199134378-459f80ded70c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1216&q=80")
    avatar = models.CharField(max_length=500, default="https://cdn-icons-png.flaticon.com/512/3177/3177440.png",)    
    country = models.CharField(max_length=200, default="USA")
    age = models.IntegerField(default=0)
    bio = models.CharField(max_length=300, default="", blank=True)
    followers = models.ManyToManyField(User, related_name="followers", blank=True)
    following = models.ManyToManyField(User, related_name="following", blank=True)

    def seralize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "background_cover": self.background_cover,
            "avatar": self.avatar,
            "country": self.country,
            "age": self.age,
            "bio": self.bio,
            "followers": [follower.username for follower in self.followers.all()],
            "following": [following.username for following in self.following.all()]
        }

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user")
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="post")

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "post": self.post.id
        }

class Post(models.Model):
    user = models.ForeignKey(User, blank=True, on_delete=models.CASCADE, related_name="posts")
    user_avatar = models.CharField(max_length=500, default="https://cdn-icons-png.flaticon.com/512/3177/3177440.png",)
    content = models.CharField(max_length=300)
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.IntegerField(default=0)

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "content": self.content,
            'user_avatar': self.user_avatar,
            "timestamp": self.timestamp.strftime("%b. %d %Y, at %I:%M %p"),
            "likes": self.likes
        }

class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comments")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    content = models.CharField(max_length=280)
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "post": self.post.id,
            "content": self.content,
            "timestamp": self.timestamp.strftime("%b. %d %Y, at %I:%M %p")
        }