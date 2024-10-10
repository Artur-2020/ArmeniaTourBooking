# setup.sh
#!/bin/bash

# Добавить текущего пользователя в группу docker
sudo usermod -aG docker $USER

# Изменить права доступа на Docker сокет
sudo chown root:docker /var/run/docker.sock

# Перезапустить Docker сервис
sudo systemctl restart docker

echo "Настройка завершена. Пожалуйста, выйдите и снова войдите в систему или выполните 'newgrp docker', чтобы изменения вступили в силу."
