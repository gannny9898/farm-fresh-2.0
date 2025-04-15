# PHP Installation Guide for Windows

## Option 1: Using XAMPP (Recommended for beginners)

1. Download XAMPP from [https://www.apachefriends.org/download.html](https://www.apachefriends.org/download.html)
2. Choose the version with PHP 8.x
3. Run the installer and follow the installation wizard
4. During installation, you only need to select Apache and PHP components
5. After installation, start the XAMPP Control Panel and start the Apache service
6. Add PHP to your system PATH:
   - Go to System Properties > Advanced > Environment Variables
   - Edit the PATH variable and add the path to PHP (typically `C:\xampp\php`)
   - Click OK to save changes

## Option 2: Manual PHP Installation

1. Download PHP for Windows from [https://windows.php.net/download/](https://windows.php.net/download/)
2. Choose the Thread Safe version (VS16 x64 Thread Safe)
3. Extract the ZIP file to a folder (e.g., `C:\php`)
4. Add PHP to your system PATH:
   - Go to System Properties > Advanced > Environment Variables
   - Edit the PATH variable and add the path to PHP (e.g., `C:\php`)
   - Click OK to save changes
5. Create a `php.ini` file:
   - Copy `php.ini-development` to `php.ini` in the PHP folder
   - Open `php.ini` and uncomment (remove the `;` at the beginning) these lines:
     - `extension=curl`
     - `extension=fileinfo`
     - `extension=mbstring`
     - `extension=openssl`
     - `extension=pdo_mysql`
     - `extension=pdo_sqlite`

## Verifying Installation

After installation, open a new command prompt or PowerShell window and run:

```
php -v
```

This should display the PHP version information, confirming that PHP is installed correctly.

## Starting the PHP Development Server

Once PHP is installed, you can start the development server with:

```
php -S localhost:8000
```

This will start a PHP development server on port 8000, which you can access at http://localhost:8000 in your web browser. 