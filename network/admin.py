from django.contrib import admin

# Register your models here.

from .models import *

class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "email")

class ProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "avatar", "country", "age", "bio", "followers", "following")

    def followers(self, obj):
        return obj.followers.all()
    
    def following(self, obj):
        return obj.following.all()


class PostAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "content", "timestamp")

class LikeAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "post")

    def user(self, obj):
        return obj.user.username
    def post(self, obj):
        return obj.post.id
    

class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "post", "content", "timestamp")

    def user(self, obj):
        return obj.user.username
    def post(self, obj):
        return obj.post.id

admin.site.register(User, UserAdmin)
admin.site.register(Post, PostAdmin)
admin.site.register(Like, LikeAdmin)
admin.site.register(Profile, ProfileAdmin)
admin.site.register(Comment, CommentAdmin)
