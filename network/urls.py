
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API 
    path("network/<str:section>", views.section, name="section"),
    path("new-post", views.new_post, name="new-post"),
    path("edit-post/<int:post_id>", views.edit_post, name="edit-post"),
    path("like-post/<int:post_id>", views.like_post, name="like-post"),
    path("follow-user/<str:username>", views.follow_user, name="follow-user"),
    # edit profile
    path("edit-profile", views.edit_profile, name="edit-profile"),
    # profile
    path("profile/<str:username>", views.user_profile, name="profile"),
    # comments
    path("comments/<int:post_id>", views.new_comment, name="comments"),
    # get comments
    path("get-comments/<int:post_id>", views.get_comments, name="get-comments"),



    



]
