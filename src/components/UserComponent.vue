<template>
  <div class="user-container" @mouseleave="showOptions = false">
    <div class="user-avatar-container" @mouseover="showOptions = true">
      <div class="user-avatar">
        <img :src="user.avatar" alt="User Avatar" />
      </div>
      <p class="user-name">{{ user.name }}</p>
    </div>
    <div class="user-info" v-show="showOptions">
      <div class="user-options">
        <div class="more-info">
          <p>Email: {{ user.email }}</p>
          <p>Country: {{ user.country }}</p>
        </div>
        <button @click="logout">Log out</button>
      </div>
    </div>
  </div>
</template>

<script>
const { getMe } = require('./../api')

export default {
  name: 'UserComponent',
  props: ['client_id', 'redirect_uri'],
  data () {
    return {
      user: {
        name: 'Loading',
        avatar:
          'https://media.istockphoto.com/id/476085198/photo/businessman-silhouette-as-avatar-or-default-profile-picture.jpg?s=612x612&w=0&k=20&c=GVYAgYvyLb082gop8rg0XC_wNsu0qupfSLtO7q9wu38=',
        email: 'Loading',
        country: 'Loading'
      },
      showOptions: false
    }
  },
  created () {
    if (localStorage.getItem('user_data') === null) {
      this.getProfile().then(data => {
        this.user = data
        localStorage.setItem('user_data', JSON.stringify(data))
      })
    } else {
      this.user = JSON.parse(localStorage.getItem('user_data'))
    }
  },
  methods: {
    logout () {
      this.$emit('logout')
    },
    async getProfile () {
      return getMe()
        .then(response => {
          return response.json()
        })
        .then(data => ({
          name: data.display_name,
          avatar:
            data.images.length > 0
              ? data.images[0]
              : 'https://media.istockphoto.com/id/476085198/photo/businessman-silhouette-as-avatar-or-default-profile-picture.jpg?s=612x612&w=0&k=20&c=GVYAgYvyLb082gop8rg0XC_wNsu0qupfSLtO7q9wu38=',
          email: data.email,
          country: data.country
        }))
    }
  }
}
</script>

<style scoped>
.user-container {
  display: flex;
  align-items: center;
  position: relative;
}

.user-avatar {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 10px;
  cursor: pointer;
  margin: 20px 20px 5px;
}
.user-avatar-container {
  border: #fff 1px solid;
  border-radius: 12px;
}
.user-avatar img {
  width: 100%;
  height: 100%;
  margin: auto 0 auto;
  object-fit: fill;
}

.user-info {
  position: absolute;
  display: flex;
  height: 100%;
  top: 0;
  left: 100px;
  flex-direction: column;
}
.user-options {
  display: flex;
  height: 100%;
  justify-content: space-around;
  flex-direction: column;
}
.user-name {
  font-weight: bold;
  text-align: center;
}

.user-avatar:hover .user-options {
  display: block;
}

.user-options button {
  margin-bottom: 5px;
}

.more-info {
  font-size: 14px;
  color: gray;
}
</style>
