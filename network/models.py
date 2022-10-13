from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Profile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="profile")
    avatar = models.CharField(max_length=500, default="https://cdn-icons-png.flaticon.com/512/3177/3177440.png",)    
    country = models.CharField(max_length=200, default="USA")
    age = models.IntegerField(default=0)
    bio = models.CharField(max_length=200, default="")

    def __str__(self):
        return f"{self.user}"
class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="follower")
    following = models.ManyToManyField(User, related_name="following", blank=True)

    def serialize(self):
        return {
            "follower": self.follower.username,
            "following": [user.username for user in self.following.all()]
        }
class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user")
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="post")

    def __str__(self):
        return f"{self.user} likes {self.post}"

class Post(models.Model):
    user = models.ForeignKey(User, blank=True, on_delete=models.CASCADE, related_name="posts")
    user_avatar = models.CharField(max_length=500, default="https://cdn-icons-png.flaticon.com/512/3177/3177440.png",)
    content = models.CharField(max_length=280)
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.IntegerField(default="0")

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "content": self.content,
            'user_avatar': self.user_avatar,
            "timestamp": self.timestamp,
            "likes": self.likes
        }