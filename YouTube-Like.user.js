// ==UserScript==
// @name         YouTube-Like
// @namespace    http://sedatkilinc05.github.io/
// @version      0.6.8.3
// @description  Automatic Like or Dislike of YouTube-Clips of selected channels
// @author       Sedat Kpunkt <sedatkilinc05@gmail.com>
// @match        https://*.youtube.com/watch*
// @match        https://*.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// @supportURL   https://github.com/sedatkilinc05/tampermonkey-scriptz/
// @homepageURL  http://sedatkilinc05.github.io
// @updateURL 	 https://github.com/sedatkilinc05/tampermonkey-scriptz/raw/main/YouTube-Like.user.js
// @downloadURL  https://github.com/sedatkilinc05/tampermonkey-scriptz/raw/main/YouTube-Like.user.js
// ==/UserScript==

(function() {
    'use strict';

    function logit(...args) {
        console.log('[SEDAT•YouTube-Like]:', ...args);
    }

    logit('Start');

    let pressedAltR = false;

    let btnLike = undefined;
    let btnDisLike = undefined;

    const arrEventType = [ 'loadstart', 'play', 'playing', 'load', 'selectionchange', 'canplay', 'change', 'slotchange' ];
    const arrChannels = [ ];
    const arrDislikeChannels = [ ];

    let currentChannel = '';
    let currentTitle = getTitle();

    if (localStorage.getItem('channels') === null) {
        saveChannel('@SedatKPunkt');
        saveChannel('@garipthecat2067');
    } else {
        arrChannels.push(...JSON.parse(localStorage.getItem('channels')))
    }

    if (localStorage.getItem('dislikechannels') !== null) {
        arrDislikeChannels.push(...JSON.parse(localStorage.getItem('dislikechannels')))
    }

    const loadListener = (ev) => {
        logit(' Event '+ ev.type + '•' + ev.target + '.addEventListener',ev);
        findChannelName(ev.target + '.' + ev.type);
        lookForLikeButton(0);
        removeAdRendererAll();
    }

    const keyUpListener = ev => {
        logit('keyup event object', ev);
/*        ev.preventDefault();
        ev.stopPropagation();*/

        findChannelName('onkeyup');

        if (ev.altKey === false) {
            return;
        };

        logit('alt key down', ev);

        switch (ev.code) {
            case 'KeyL':
                handleChannel(currentChannel);
                pressedAltR = false;
                break;
            case 'KeyR':
                pressedAltR = true;
                break;
            case 'KeyA':
                pressedAltR && resetAllChannels();
                (pressedAltR) ? logit('all DISLIKED-channels reseted', localStorage.channels, localStorage.dislikechannels) : logit('Press Alt-R then Alt-A to delete all channels');
                pressedAltR = false;
                break;
            case 'KeyC':
                pressedAltR && resetLikedChannels();
                (pressedAltR) ? logit('all DISLIKED-channels reseted', localStorage.channels, localStorage.dislikechannels) : logit('Press Alt-R then Alt-C to delete all LIKE-channels');
                pressedAltR = false;
                break;
            case 'KeyD':
                pressedAltR && resetDislikedChannels();
                (pressedAltR) ? logit('all DISLIKED-channels reseted', localStorage.channels, localStorage.dislikechannels) : logit('Press Alt-R then Alt-D to delete all DISLIKE-channels');
                pressedAltR = false;
                break;
            default:
                pressedAltR = false;
                break
        }
    }

    window.addEventListener('load', loadListener);

    document.addEventListener('load', loadListener);

    // transitionend
    document.addEventListener('transitionend', loadListener);

    document.addEventListener('keyup', keyUpListener);

    function findChannelName(from = 'default') {
        logit('findChannelName', from);
        let found = false;

        currentTitle = getTitle();
        logit('currentTitle', currentTitle);
        logit('saveTitle', saveTitle());

        let allAnchorTagsChannel = document.querySelectorAll('a[href^="/c"]');
        logit('allAnchorTagsChannel.length', allAnchorTagsChannel.length);

        let allAnchorTagsChannelName = document.querySelectorAll('ytd-video-owner-renderer.ytd-watch-metadata  > div.ytd-video-owner-renderer  > ytd-channel-name.ytd-video-owner-renderer  > div.ytd-channel-name  > div.ytd-channel-name  > yt-formatted-string.ytd-channel-name.complex-string  > a.yt-simple-endpoint.yt-formatted-string');
        logit('allAnchorTagsChannelName.length', allAnchorTagsChannelName.length);
        if (!found && allAnchorTagsChannelName.length > 0) {
            currentChannel = allAnchorTagsChannelName[0].href.split('/').pop();
            logit('currentChannel', currentChannel);
            if (arrChannels.indexOf(currentChannel) > -1) {
                lookForLikeButton(1);
            }
            if (arrDislikeChannels.indexOf(currentChannel) > -1) {
                lookForLikeButton(2);
            }
            found=true;
        }
    }

    function lookForLikeButton(action) {
        logit('lookForLikeButton', 'action = ' + action);
        // '#segmented-like-button ytd-toggle-button-renderer yt-button-shape button'
       //  '.watch-active-metadata .ytd-toggle-button-renderer button#button.yt-icon-button'
        if ((btnLike = document.querySelectorAll('#segmented-like-button ytd-toggle-button-renderer yt-button-shape button')[0]
             || document.querySelectorAll('.watch-active-metadata .ytd-toggle-button-renderer button#button.yt-icon-button')[0]
            || document.querySelectorAll('segmented-like-dislike-button-view-model like-button-view-model > toggle-button-view-model button')[0]) &&
           (btnDisLike = document.querySelectorAll('#segmented-dislike-button ytd-toggle-button-renderer yt-button-shape button')[0]
            || document.querySelectorAll('.watch-active-metadata .ytd-toggle-button-renderer button#button.yt-icon-button')[1]
           || document.querySelectorAll('segmented-like-dislike-button-view-model dislike-button-view-model > toggle-button-view-model button')[0])) {
            logit('btnLike = ', btnLike, "btnDisLike", btnDisLike);
            switch(action) {
                case 1:
                    logit('lookForLikeButton • btnLike is', btnLike.firstChild.firstChild.classList.contains('style-default-active'));;
                    if (btnLike.ariaPressed === 'false') {

                        btnLike.click();
                    }
                    break;
                case 2:
                    logit('lookForDisLikeButton • btnDisLike is', btnLike.firstChild.firstChild.classList.contains('style-default-active'));;
                    if (btnDisLike.ariaPressed === 'false') {

                        btnDisLike.click();
                    }
                    break;
                default:
                    logit('lookForLikeButton • 1 btnLike is', btnLike.firstChild.firstChild.classList.contains('style-default-active'));
                    break;
            }
        }
    }

    function handleChannel(channelName) {
        if (channelName == "") {
            return;
        }
        if (arrChannels.indexOf(channelName) < 0) {
            saveChannel(channelName);
            lookForLikeButton(1);
        } else {
            removeChannel(channelName);
            saveDislikeChannel(channelName);
            lookForLikeButton(2);
        }
    }

    function saveChannel(channelName) {
        if (arrChannels.indexOf(channelName) > -1) {
            return;
        }
        arrChannels.push(channelName);
        localStorage.setItem('channels',JSON.stringify(arrChannels));
    }

    function saveDislikeChannel(channelName) {
        if (arrDislikeChannels.indexOf(channelName) > -1) {
            return;
        }
        arrDislikeChannels.push(channelName);
        localStorage.setItem('dislikechannels',JSON.stringify(arrDislikeChannels));
    }

    function resetLikedChannels() {
        arrChannels.splice(0, arrChannels.length);
        localStorage.setItem('channels',JSON.stringify(arrChannels));
        saveChannel('@SedatKPunkt');
        saveChannel('@garipthecat2067');
    }

    function resetDislikedChannels() {
        arrDislikeChannels.splice(0, arrDislikeChannels.length);
        localStorage.setItem('dislikechannels',JSON.stringify(arrDislikeChannels));
    }

    function resetAllChannels() {
        resetLikedChannels();
        resetDislikedChannels();
    }

    function removeChannel(channelName) {
        if (arrChannels.indexOf(channelName) < 0) {
            return;
        }
        arrChannels.splice(arrChannels.indexOf(channelName), 1);
        localStorage.setItem('channels', JSON.stringify(arrChannels));
    }

    function removeDislikeChannel(channelName) {
        if (arrDislikeChannels.indexOf(channelName) < 0) {
            return;
        }
        arrDislikeChannels.splice(arrDislikeChannels.indexOf(channelName), 1);
        localStorage.setItem('dislikechannels', JSON.stringify(arrDislikeChannels));
    }

    function getTitle() {
        return document.title.replace(/^\(\d*\)\s/,'');
    }

    function saveTitle() {
        currentTitle = getTitle() ;
        logit(' saveTitle• CurrentTitle', currentTitle);
        return currentTitle;
    }

    function isNewVideo() {
        return (currentTitle !== getTitle());
    }

    function removeAdRenderer() {
        let adRenderer = document.querySelector('#rendering-content');
        if (adRenderer != null) {
            adRenderer.remove();
        }
    }

    function removeAdRendererAll() {
        let nlAdRenderer = document.querySelectorAll('#rendering-content');
        nlAdRenderer.forEach(adRenderer => adRenderer.remove());
    }

    function ExecuteOnEachAdRenderer(onElementExecute) {
        let nlAdRenderer = document.querySelectorAll('#rendering-content');
        nlAdRenderer.forEach(onElementExecute);
    }
})();






