if (!this.Memolane) {
  Memolane = {};
}

$(function() {
  $("a.delete_user").click( function() {
    if (confirm("Really delete user? (This cannot be undone)")) { 
      var id = $(this).attr("href")
      var csrf_token =  $(this).attr("csrf_token")
      $.ajax({
        type: 'delete',
        data: { "_csrf": csrf_token },
        url: "/admin/user/" + id,
        complete: function(xhr) {
        }
      });
    }
    return false;
  });
  
  $("a.pw_reset").click( function() {
    if (confirm("send new pw to user?")) { 
      var email = $(this).attr("href")
      var csrf_token =  $(this).attr("csrf_token")
      $.ajax({
        type: 'post',
        url: "/reset",
        data: { "email": email, "_csrf": csrf_token  },
        complete: function(xhr) {
        }
      });
    }
    return false;
  });
  
  $("a.image_reset").click( function() {
    if (confirm("Remove profile pic from this user")) { 
      var id = $(this).attr("href")
      var csrf_token =  $(this).attr("csrf_token")
      $.ajax({
        type: 'post',
        url: "/admin/reset_image",
        data: { "id": id, "_csrf": csrf_token },
        complete: function(xhr) {
          window.location.reload();
        }
      });
    }
    return false;
  });
  
  $('.earlyAccess[contenteditable="true"]').each(function(i, e) {
    var editable = $(e);
    var field = editable.attr("field");
    var oldText;
    editable.focus(function() {
      oldText = editable.text();
    }).blur(function() {
      var text = editable.text();
      var csrf_token = editable.attr("csrf_token");
      var user_id = editable.attr("user_id");
      if (text !== oldText) {
        text = text.replace(" ", "");
        $.ajax({
          type: 'post',
          url: "/admin/early_access",
          data: { "id": user_id, "services": text, "_csrf": csrf_token },
          complete: function(xhr) {
            window.location.reload();
          }
        });
      }
    }).keydown(function(e) {
      if (e.keyCode === 27) {
        editable.text(oldText).blur();
      } else if (e.keyCode === 13) {
        editable.blur();
      }
    });
  });
  
  
  
  
});
