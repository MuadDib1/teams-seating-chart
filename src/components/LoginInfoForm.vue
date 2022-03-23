<template>
  <form action="">
    <div class="modal-card" style="width: auto">
      <header class="modal-card-head">
        <p class="modal-card-title">Teams ログイン情報</p>
        <button type="button" class="delete" @click="$emit('close')" />
      </header>
      <section class="modal-card-body">
        <div class="block">
          まず初めに、ログイン情報を入力して Teams へログインしてください。
        </div>
        <b-field label="メールアドレス">
          <b-input
            type="email"
            v-model="email"
            placeholder="Your email"
            required
          >
          </b-input>
        </b-field>

        <b-field label="パスワード">
          <b-input
            type="password"
            v-model="password"
            password-reveal
            placeholder="Your password"
            required
          >
          </b-input>
        </b-field>

        <div class="block">
          
        </div>
      </section>
      <footer class="modal-card-foot">
        <div class="container">
          <b-button label="キャンセル" @click="$emit('close')" />
          <b-button label="ログイン" type="is-primary" @click="submit" :disabled="!valid" />
          <span class="is-size-6">
            ※別ウィンドウが立ち上がり、自動的にログインします
          </span>
        </div>
      </footer>
    </div>
  </form>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
    }
  },
  computed: {
    valid() {
      return this.email && this.password
    }
  },
  methods: {
    submit() {
      this.$emit('submit', {
        email: this.email,
        password: this.password
      })
    }
  }
};
</script>

<style>
</style>