from setuptools import setup, find_packages

setup(
  name = "peasy",
  version = "0.1.0",
  packages = find_packages(),

  author='Cao Xingming(Simeon.Chaos)',
  author_email='simeon.chaos@gmail.com',
  license='MIT License',
  url='https://github.com/chaosim/peasy',
  download_url='http://pypi.python.org/pypi/peasy',
  keywords = "peasy parser",

  description='an easy but powerful parser',
  long_description='''Parsing is easy! With Peasy, you write the parser by hand, just like to write any other kind of program.''',
  
  platforms='Posix; MacOS X; Windows',
  classifiers = ['Development Status :: 3 - Alpha',
               'License :: OSI Approved :: MIT License',
               'Natural Language :: English',
               'Programming Language :: Python',
               'Topic :: Software Development :: Compilers',
               'Topic :: Text Processing :: General',
               'Intended Audience :: Developers']
)