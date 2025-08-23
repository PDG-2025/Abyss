import time


def hello_world():
    return "Hello World !"


def bye():
    return "Bye"


def main():
    print(hello_world())
    time.sleep(10)
    print(bye())
    time.sleep(5)


if __name__ == "__main__":
    main()
