import pytest
from hello_world.main import hello_world, bye


def test_hello():
    result = hello_world()
    assert "Hello World !" in result


def test_bye():
    result = bye()
    assert "Bye" in result
