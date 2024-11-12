import sys
if sys.platform == 'win32':
    sys.modules['pwd'] = __import__('utils.pwd_mock')

class struct_passwd:
    def __init__(self):
        self.pw_name = "default"
        self.pw_passwd = "x"
        self.pw_uid = 1000
        self.pw_gid = 1000
        self.pw_gecos = "default"
        self.pw_dir = "/home/default"
        self.pw_shell = "/bin/bash"

def getpwuid(uid):
    return struct_passwd() 