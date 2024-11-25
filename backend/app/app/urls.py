from django.urls import path
from . import views
from django.contrib.auth.views import LoginView, LogoutView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('verify/', views.verify_document, name='verify_document'),
    path('login/', views.login_view, name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('create_signed_document/', views.create_signed_document, name='create_signed_document'),
    path('download/<str:document_id>/', views.download_document, name='download_document'),
    path('documents/', views.list_documents, name='list_documents'),
    path('create_user/', views.create_user, name='create_user'),
    path("users/", views.list_users, name="list_users"),
    path("users/<int:user_id>/", views.update_user, name="update_user"),
] 

# Only add static file serving in debug mode
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)