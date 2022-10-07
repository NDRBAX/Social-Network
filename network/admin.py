from django.contrib import admin

# Register your models here.

from .models import *

class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "email")

class PostAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "content", "timestamp")

class LikeAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "post")

class FollowAdmin(admin.ModelAdmin):
    list_display = ("id", "follower", "following")

    def following(self, obj):
        return obj.following.all()

admin.site.register(User, UserAdmin)
admin.site.register(Post, PostAdmin)
admin.site.register(Like, LikeAdmin)
admin.site.register(Follow, FollowAdmin)
