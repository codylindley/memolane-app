/*---------------------------------------------------------------------------------------------------- 

JS Conventions

- Constructors should start with a capital letter
- Opening braces go on the same line as the statement e.g. if(true){
- Use the triple equality operator e.g. === not ==
- Use jslint when you can to keep things clean
- Braces are always used even if you have the option to omit e.g. don't do if(true)return;
- Always use ; even if you don't need too

Memolane App Conventions

- Single quotes are USED for all js unless you are dealing with a JSON property or HTML attributes
- Do not use constructors and prototypes for singletons
- Use camel case capitalization e.g. goToThatAndThis
- Use tab for indenting
- Everything should be contained inside of its own namespace or the m. namespace
- For long strings use string concatenation e.g. http://minify.me/?dqnhz6
- Pick jQuery events carefully as most of the events used will require a custom event string
- Modules keep there own state as static properties or as data() on the DOM element 

----------------------------------------------------------------------------------------------------*/

m.globalTemplates = {

	dialogs: {
		
		removeLane:
			'<div id="" class="memolaneDialog">'
			+'	<div class="dialogTopBar">'
			+'		<div class="dialogTitle">'+$.i18n.t('Remove Lane')+'</div>'
			+'		<div class="close closeMemolaneDialog cancelAddingBtn">'+$.i18n.t('cancel','close remove lane dialog')+'</div>'
			+'		<div class="clearFloatNoHeight"></div>'
			+'	</div>'
			+'	<div class="dialogContent">'
			+'		<p><strong>'+$.i18n.t('Are you sure you want to remove')+' "${title}" '+$.i18n.t('from Memolane?')+'</strong></p>'
			+'		<p>'+$.i18n.t('All settings will be lost, and any work you\'ve put into curating this lane will be permanently gone!')+'</p>'
			+'		<p><a href="#" class="btn-red float-left removeConfirm close">'+$.i18n.t('Yes, REMOVE the lane')+'</a> <a href="#" class="secondaryAction float-left close">'+$.i18n.t('No, I don\'t want that')+'</a></p>'
			+'	</div>'
			+'</div>'
		,
		
		removeLaneContributor:
			'<div id="" class="memolaneDialog">'
			+'	<div class="dialogTopBar">'
			+'		<div class="dialogTitle">'+$.i18n.t('Stop Contributing?')+'</div>'
			+'		<div class="close closeMemolaneDialog cancelAddingBtn">'+$.i18n.t('cancel','close remove lane contributor dialog')+'</div>'
			+'		<div class="clearFloatNoHeight"></div>'
			+'	</div>'
			+'	<div class="dialogContent">'
			+'		<p><strong>'+$.i18n.t('Are you sure you wish to stop contributing to this lane:')+' ${lane_title}</strong></p>'
			+'		<p><a href="#" class="btn-red float-left removeConfirm close">'+$.i18n.t('Remove me as a contributor from this lane')+'</a> <a href="#" class="secondaryAction float-left close">'+$.i18n.t('No, I don\'t want that')+'</a></p>'
			+'	</div>'
			+'</div>'
		,
		
		addFriend:
			'<div id="" class="memolaneDialog">'
			+'	<div class="dialogTopBar">'
			+'		<div class="dialogTitle">'+$.i18n.t('Friend Request Sent')+'</div>'
			+'		<div class="close closeMemolaneDialog cancelAddingBtn">'+$.i18n.t('close','close dialog')+'</div>'
			+'		<div class="clearFloatNoHeight"></div>'
			+'	</div>'
			+'	<div class="dialogContent">'
			+'		<p><strong>'+$.i18n.t('Cross your fingers!')+'</strong></p>'
			+'		<p>'+$.i18n.t('You just sent a friend request to')+' ${first_name} ${last_name}.</p>'
			+'		<p><a href="#" class="btn-green float-left close">'+$.i18n.t('OK','ok button for dialog')+'</a></p>'
			+'	</div>'
			+'</div>'
		,
		
		acceptFriendRequest:
			'<div id="" class="memolaneDialog">'
			+'	<div class="dialogTopBar">'
			+'		<div class="dialogTitle">Accepted Friend Request</div>'
			+'		<div class="close closeMemolaneDialog cancelAddingBtn">'+$.i18n.t('close','close dialog')+'</div>'
			+'		<div class="clearFloatNoHeight"></div>'
			+'	</div>'
			+'	<div class="dialogContent">'
			+'		<p><strong>'+$.i18n.t('We\'re friends!</strong>')+'</p>'
			+'		<p>'+$.i18n.t('You just accepted <strong>${full_name}\'s</strong> friend request!')+'</p>'
			+'		<p>'+$.i18n.t('You can now see each other\'s \"Friends Only\" memos.')+'</p>'
			+'		<p><a href="#" class="btn-green float-left close">'+$.i18n.t('OK','ok button for dialog')+'</a></p>'
			+'	</div>'
			+'</div>'
		,
		
		rejectFriendRequest:
			'<div id="" class="memolaneDialog">'
			+'	<div class="dialogTopBar">'
			+'		<div class="dialogTitle">'+$.i18n.t('Ignored Friend Request')+'</div>'
			+'		<div class="close closeMemolaneDialog cancelAddingBtn">'+$.i18n.t('close','close dialog')+'</div>'
			+'		<div class="clearFloatNoHeight"></div>'
			+'	</div>'
			+'	<div class="dialogContent">'
			+'		<p><strong>'+$.i18n.t('It\'s not you, it\'s me')+'</strong></p>'
			+'		<p>'+$.i18n.t('You just ignored <strong>${full_name}\'s</strong> friend request.')+'</p>'
			+'		<p>'+$.i18n.t('At this point, you can only see each other\'s public memos.')+'</p>'
			+'	</div>'
			+'</div>'
		,
		
		cancelFriendRequest:
			'<div id="" class="memolaneDialog">'
			+'	<div class="dialogTopBar">'
			+'		<div class="dialogTitle">'+$.i18n.t('Cancelled Friend Request')+'</div>'
			+'		<div class="close closeMemolaneDialog cancelAddingBtn">'+$.i18n.t('close','close dialog')+'</div>'
			+'		<div class="clearFloatNoHeight"></div>'
			+'	</div>'
			+'	<div class="dialogContent">'
			+'		<p><strong>'+$.i18n.t('It\'s not you, it\'s me')+'</strong></p>'
			+'		<p>'+$.i18n.t('You just cancelled your request for <strong>${full_name}\'s</strong> friendship.')+'</p>'
			+'		<p>'+$.i18n.t('At this point, you can only see each other\'s public memos.')+'</p>'
			+'	</div>'
			+'</div>'
		,
		
		removeFriend:
			'<div id="" class="memolaneDialog">'
			+'	<div class="dialogTopBar">'
			+'		<div class="dialogTitle">'+$.i18n.t('Remove Friend?')+'</div>'
			+'		<div class="close closeMemolaneDialog cancelAddingBtn">'+$.i18n.t('cancel','close remove friend dialog')+'</div>'
			+'		<div class="clearFloatNoHeight"></div>'
			+'	</div>'
			+'	<div class="dialogContent">'
			+'		<p><strong>'+$.i18n.t('Are you sure you want to cancel your Memolane friendship with')+' ${full_name}</strong>?</p>'
			+'		<p>'+$.i18n.t('You and')+' ${full_name} '+$.i18n.t('will lose the ability to see each other\'s \"Friends Only\" memos and contribute to each other\'s lanes.')+'</p>'
			+'		<p><a href="#" class="btn-red float-left removeConfirm close">'+$.i18n.t('Yes, REMOVE the friend')+'</a> <a href="#" class="secondaryAction float-left close">'+$.i18n.t('No, I don\'t want that')+'</a></p>'
			+'	</div>'
			+'</div>',
			
		genericListOfUsersDialog:
			'<div id="list-users" class="memolaneDialog">'
			+'	<div class="dialogTopBar">'
			+'		<div class="dialogTitle">${$item.dialogTitle}</div>'
			+'		<div class="close closeMemolaneDialog cancelAddingBtn">'+$.i18n.t('close','close dialog')+'</div>'
			+'		<div class="clearFloatNoHeight"></div>'
			+'	</div>'
			+'	<div class="dialogContent">'
			+'<ul>'
			+'	{{each liked_by}}'
			+'		<li class="clearfix">'
			+'		<a href="/${user.username}" title="'+$.i18n.t('view user profile')+'">'
			+'		<img src="/${user.username}/images" height="20" width="20" class="search-result-icon search-user-avatar" alt="'+ $.i18n.t('top bar avatar', "this labels the lane avatar") +'"/>'
			+'		<span class="list-user-fullname-username">'
			+'		${user.full_name}'
			+'		<span class="list-users-username">(${user.username})</span>'
			+'		<span class="list-users-date">'+$.i18n.t('Liked')+' ${m.utilities.dateFormatRelative(timestamp)}</span>'
			+'		</span> '
					// for now leaving pending/friend/self empty
			/*+'		{{if user.friend=="pending" || user.friend=="self" || user.friend=="accepted" || m.currentUser === null}}'
			+''
			+'		{{else}}'
			+'		<a href="#" data-first_name="${user.first_name}" data-last_name="${user.last_name}" data-username="${user.username}" class="request-friendship" title="'+$.i18n.t('request friendship')+'">'+$.i18n.t('Request Friendship')+'</a>'
			+'		{{/if}}'*/
			+ '</a></li>'
			+'	{{/each}}'
			+'</ul>'
			+'	</div>'
			+'</div>',
	
		whoFollowedLanesDialog:
			'<div id="list-users" class="memolaneDialog">'
			+'	<div class="dialogTopBar">'
			+'		<div class="dialogTitle">${$item.dialogTitle}</div>'
			+'		<div class="close closeMemolaneDialog cancelAddingBtn">'+$.i18n.t('close','close dialog')+'</div>'
			+'		<div class="clearFloatNoHeight"></div>'
			+'	</div>'
			+'	<div class="dialogContent">'
			+'<ul>'
			+'	{{each followed}}'
			+'		<li class="clearfix">'
			+'		<a href="/${username}" title="'+$.i18n.t('view user profile')+'">'
			+'		<img src="/${username}/images" height="20" width="20" class="search-result-icon search-user-avatar" alt="'+ $.i18n.t('top bar avatar', "this labels the lane avatar") +'"/>'
			+'		<span class="list-user-fullname-username">'
			+'		${full_name}'
			+'		<span class="list-users-username">(${username})</span>'
			+'		<span class="list-users-date">'+$.i18n.t('Followed')+' ${m.utilities.dateFormatRelative(favorited_at)}</span>'
			+'		</span> '
					// for now leaving pending/friend/self empty
			/*+'		{{if user.friend=="pending" || user.friend=="self" || user.friend=="accepted" || m.currentUser === null}}'
			+''
			+'		{{else}}'
			+'		<a href="#" data-first_name="${user.first_name}" data-last_name="${user.last_name}" data-username="${user.username}" class="request-friendship" title="'+$.i18n.t('request friendship')+'">'+$.i18n.t('Request Friendship')+'</a>'
			+'		{{/if}}'*/
			+ '</a></li>'
			+'	{{/each}}'
			+'</ul>'
			+'	</div>'
			+'</div>'
	}
};