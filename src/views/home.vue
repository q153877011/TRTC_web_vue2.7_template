<template>
  <div id="app">
    <pre-conference-view
      class="tui-room"
      :user-info="userInfo"
      :room-id="givenRoomId"
      :enable-scheduled-conference="true"
      @on-create-room="handleCreateRoom"
      @on-enter-room="handleEnterRoom"
      @on-logout="handleLogOut"
      @on-update-user-name="handleUpdateUserName"
    ></pre-conference-view>
    <t-dialog
        :header="false"
        body="这是对话框内容，对话框标题已被隐藏"
        confirmBtn="Save"
        cancelBtn="Cancel"
        :visible="show"
        :onClose="bodyClose"
        :onConfirm="bodyConfirm"
    >
      <div>
        <div style="margin-bottom: 5px;">SDKAppID</div>
        <t-input
          v-model="inputData.sdkAppId"
          placeholder="Please input SDKAppID"
        />
        <div style="margin-top: 18px; margin-bottom: 5px;"> SDKSecretKey</div>
        <t-input
          style="margin-bottom: 18px;"
          v-model="inputData.sdkSecretyKey"
          placeholder="Please input sdkSecretyKey"
        />
      <t-alert theme="warning">
        <template #message> The SDKAppID and SDKSecretKey can be found in the <a href="https://console.trtc.io/overview" target="_blank">TRTC console↗</a>. See the <a href="https://trtc.io/document/35166?platform=web&product=conference#.E5.AE.A2.E6.88.B7.E7.AB.AF.E7.A4.BA.E4.BE.8B.E4.BB.A3.E7.A0.81.E8.AE.A1.E7.AE.97-UserSig" target="_blank">document↗</a> for more information. </template>
      </t-alert>
      </div>
    </t-dialog>
  </div>
</template>

<script>
import { PreConferenceView, conference, RoomEvent } from '@tencentcloud/roomkit-web-vue2.7';
import { isMobile } from '@tencentcloud/roomkit-web-vue2.7/es/utils/environment';
import i18n from '../locales/index';
import { getLanguage, getTheme } from  '../utils/utils';
import { useUIKit } from '@tencentcloud/uikit-base-component-vue2';
import LibGenerateTestUserSig from '../config/lib-generate-test-usersig-es.min';

export default {
  name: 'Home',
  components: {
    PreConferenceView,
  },
  data() {
    return {
      givenRoomId: '',
      theme: '',
      inputData: {
        sdkAppId: '',
        sdkSecretyKey: '',
      },
      show: false,
      userInfo: {
        userId: '',
        userName: '',
        userAvatar: '',
        sdkAppId: '',
        userSig: '',
        avatarUrl: '',
      },
      isMobile,
    };
  },
  async beforeMount() {
    this.givenRoomId = this.$route.query.roomId || '';
    this.userInfo = sessionStorage.getItem('tuiRoom-userInfo');
    this.userInfo = JSON.parse(this.userInfo);
    if (!this.userInfo) {
      this.userInfo = this.getBasicInfo();
      return;
    }

    const { sdkAppId, userId, userSig, userName, avatarUrl } = this.userInfo;
    await conference.login({ sdkAppId, userId, userSig });
    await conference.setSelfInfo({ userName, avatarUrl });
  },
  mounted() {
    const { theme } = useUIKit();
    conference.setLanguage(getLanguage());
    conference.on(RoomEvent.LANGUAGE_CHANGED, this.changeLanguage);
    conference.on(RoomEvent.THEME_CHANGED, this.changeTheme);
    conference.on(RoomEvent.CONFERENCE_INVITATION_ACCEPTED, this.handleAcceptedInvitation);
  },

  destroyed() {
    conference.off(RoomEvent.LANGUAGE_CHANGED,  this.changeLanguage);
    conference.off(RoomEvent.THEME_CHANGED,  this.changeTheme);
    conference.off(RoomEvent.CONFERENCE_INVITATION_ACCEPTED, this.handleAcceptedInvitation);
  },
  methods: {
    getBasicInfo(SDKAPPID = 0, SDKSECRETKEY = '') {
      const EXPIRETIME = 604800;
      const userInfo = {
        userId: `user_${Math.ceil(Math.random() * 100000)}`,
        userName: 'myName',
        avatarUrl: '',
      };
      if (SDKAPPID === Number(0) || SDKSECRETKEY === String('')) {
        // alert('Please configure your SDKAPPID in config/basic-info-config.js');
        return;
      }
      const generator = new LibGenerateTestUserSig(Number(SDKAPPID), SDKSECRETKEY, EXPIRETIME);
      const userSig = generator.genTestUserSig(userInfo.userId);
      const { userId, userName, avatarUrl } = userInfo;
      return {
        sdkAppId: SDKAPPID,
        userId,
        userSig,
        userName,
        avatarUrl,
      };
    },
    bodyClose() {
      this.show = false;
    },
    bodyConfirm() {
      this.userInfo = this.getBasicInfo(Number(this.inputData.sdkAppId), this.inputData.sdkSecretyKey);
      sessionStorage.setItem('tuiRoom-userInfo', JSON.stringify(this.userInfo));
      this.show = false;
    },
    setTUIRoomData(action, roomOption) {
      sessionStorage.setItem('tuiRoom-roomInfo', JSON.stringify({
        action,
        ...roomOption,
      }));
    },
    async checkRoomExistWhenCreateRoom(roomId) {
      let isRoomExist = false;
      const tim = conference.getRoomEngine()?.getTIM();
      try {
        const value = await tim?.searchGroupByID(roomId);
        console.log(value);
        isRoomExist = !!value;
      } catch (error) {
        console.log(error);
        // The room doesn't exist.
      }
      return isRoomExist;
    },
    // Generate room number when creating a room
    async generateRoomId() {
      const roomId = Math.ceil(Math.random() * 10000000);
      console.log(roomId);
      const isRoomExist = await this.checkRoomExistWhenCreateRoom(String(roomId));
      console.log(isRoomExist);
      if (isRoomExist) {
        return await this.generateRoomId();
      }
      return roomId;
    },
    // Processing click on [Create Room]
    async handleCreateRoom(roomOption) {
      if (!this.userInfo) {
        this.show = true;
        return;
      }
      this.setTUIRoomData('createRoom', roomOption);
      const roomId = await this.generateRoomId();
      sessionStorage.setItem('tuiRoom-roomId', roomId);
      this.$router.push({ path: 'room', query: { roomId } });
    },
    // Processing click on [enter room]
    async handleEnterRoom(roomOption) {
      if (!this.userInfo) {
        this.show = true;
        return;
      }
      const { roomId } = roomOption;
      this.setTUIRoomData('enterRoom', roomOption);
      this.$router.push({
        path: 'room',
        query: {
          roomId,
        },
      });
    },
    // Processing user clicks [Logout] in the upper left corner of the page
    handleLogOut() {
      sessionStorage.removeItem('tuiRoom-userInfo');
      sessionStorage.removeItem('tuiRoom-roomInfo');
      conference.logout();
      location.reload();
      // The accessor handles the logout method
    },
    // Update userName modified by the user himself
    handleUpdateUserName(userName) {
      try {
        const storageUserInfo = JSON.parse(sessionStorage.getItem('tuiRoom-userInfo'));
        storageUserInfo.userName = userName;
        sessionStorage.setItem('tuiRoom-userInfo', JSON.stringify(storageUserInfo));
      } catch (error) {
        console.log('sessionStorage error', error);
      }
    },
    changeTheme(theme) {
      localStorage.setItem('tuiRoom-currentTheme', theme);
    },
    changeLanguage(language) {
      i18n.global.locale.value = language;
      localStorage.setItem('tuiRoom-language', language);
    },
    async handleAcceptedInvitation(roomId) {
      await this.handleEnterRoom({
        roomId,
        roomParam: {
          isOpenCamera: false,
          isOpenMicrophone: true,
        },
      });
    },
  },
};
</script>

<style sass scoped>
:deep(.tui-room .schedule-room-region) {
  display: none;
}

:deep(.tui-room #scheduleRoomContainer) {
  display: none;
}

:deep(.tui-room .logo-container .logo) {
  margin-bottom: 0;
}

</style>
