
registry = require '@nikitajs/core/lib/registry'

registry.register
  file:
    types:
      ceph_conf: '@nikitajs/filetypes/src/ceph_conf'
      krb5_conf: '@nikitajs/filetypes/src/krb5_conf'
      locale_gen: '@nikitajs/filetypes/src/locale_gen'
      my_cnf: '@nikitajs/filetypes/src/my_cnf'
      pacman_conf: '@nikitajs/filetypes/src/pacman_conf'
      ssh_authorized_keys: '@nikitajs/filetypes/src/ssh_authorized_keys'
      yum_repo: '@nikitajs/filetypes/src/yum_repo'

registry.deprecate ['file', 'type', 'etc_group', 'read'], ['system', 'group', 'read'], '@nikitajs/core/lib/system/group/read'
registry.deprecate ['file', 'type', 'etc_passwd', 'read'], ['system', 'user', 'read'], '@nikitajs/core/lib/system/user/read'
