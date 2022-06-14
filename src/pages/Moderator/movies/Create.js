import { Alert, AlertIcon } from "@chakra-ui/alert";
import axios from "axios";
import React, { Component } from "react";
import UserContext from "../../../Context/UserContext";
import Error from "../../../components/Error";

export default class Create extends Component {
  static contextType = UserContext;
  constructor(props) {
    super(props);
    this.state = {
      suggestions: [],
      name: "",
      imdb: "",
      page: 1,
      totalPages: 1,
      duration: "",
      year: "",
      overview: "",
      title: "",
      image: "",
      language: "",
      origin: "",
      quality: "",
      tags: "",
      categoriesM: [],
      categories: [],
      cats: [],
      cats2: [],
      actorsM: [],
      directorsM: [],
      actors: [],
      directors: [],
      srcName: "",
      src: "",
      errors: [],
      token: "",
      bg: "",
    };
  }

  fetchCats = async () => {
    axios({
      url: "moderator/categories",
      method: "GET",
      responseType: "json",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + this.state.token,
      },
    })
      .then(async (res) => {
        await this.setState({
          cats2: res.data,
        });
        // console.log(this.state.cats);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  fetchSuggestionsByName = async (page) => {
    if (this.state.name !== "") {
      let url =
        "https://api.themoviedb.org/3/search/movie?api_key=e9d2c04b66ea46ff8dd8798d69c92134&&language=fr-FR&query=" +
        this.state.name +
        "&page=" +
        page;
      await axios({
        url,
        method: "get",
        responseType: "json",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then(async (res) => {
          // console.log(res.data);
          await this.setState({
            suggestions: res.data.results,
            page: res.data.page,
            totalPages: res.data.total_pages,
          });
          //   console.log(this.state.suggestions);
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
    }
  };

  fetchSuggestionsById = async (page) => {
    if (this.state.imdb !== "") {
      let url =
        "https://api.themoviedb.org/3/find/" +
        this.state.imdb +
        "?api_key=e9d2c04b66ea46ff8dd8798d69c92134&&language=fr-FR&external_source=imdb_id&page=" +
        page;
      await axios({
        url,
        method: "get",
        responseType: "json",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then(async (res) => {
          // console.log(res.data.movie_results);
          await this.setState({
            suggestions: res.data.movie_results,
            page: res.data.page,
            totalPages: res.data.total_pages,
          });
          //   console.log(this.state.suggestions);
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
    }
  };

  //Check Language
  checkLang = () => {
    let lang = '';
    if (this.state.vf){
      lang += "VF";
    }
    if (this.state.vf && this.state.vostfr){
      lang += " / ";
    }
    if (this.state.vostfr){
      lang += "VOSTFR";
    }
    return lang;
  }

  // Create a new movie
  handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      title: this.state.title,
      duration: this.state.duration,
      origin: this.state.origin,
      year: this.state.year,
      img: this.state.image,
      actors: this.state.actors,
      categories: this.state.cats,
      directors: this.state.directors,
      description: this.state.overview,
      quality: this.state.quality,
      lang: this.checkLang(),
      allow_comments: 0,
      is_approved: 0,
      tags: this.state.tags,
      type: "movie",
      bg: this.state.bg,
    };
/*    console.log(data);
    return null;*/

    await this.setState({
      errors: [],
    });

    await axios({
      url: "/moderator/posts",
      method: "post",
      data,
      responseType: "json",
      headers: {
        Authorization: `Bearer ${this.state.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => {
        // console.log(res.data);
        await this.setState({
          errors: [],
          duration: "",
          year: "",
          overview: "",
          title: "",
          image: "",
          language: "",
          origin: "",
          quality: "",
          tags: [],
          categoriesM: [],
          categories: [],
          actorsM: [],
          directorsM: [],
          actors: [],
          directors: [],
          sources: [],
          srcName: "",
          src: "",
          bg: "",
          vf: false,
          vostfr: false,
        });

        window.location.href = "/moderator/movies";
      })
      .catch(async (err) => {
        await this.setState({
          errors: [...this.state.errors, err.response.data.message],
        });
      });
  };

  handleNameSearch = (e) => {
    e.preventDefault();
    this.fetchSuggestionsByName(this.state.page);
  };

  handleImdbSearch = (e) => {
    e.preventDefault();
    this.fetchSuggestionsById(this.state.page);
  };

  clearState = () => {
    this.setState({
      duration: "",
      year: "",
      overview: "",
      title: "",
      image: "",
      language: "",
      origin: "",
      quality: "",
      tags: "",
      categories: [],
      cats: [],
      actors: [],
      directors: [],
      srcName: "",
      src: "",
      bg: '',
    });
  }

  handleMovieChange = async (id) => {
    this.clearState();
    let url =
      "https://api.themoviedb.org/3/movie/" +
      id +
      "?api_key=e9d2c04b66ea46ff8dd8798d69c92134&&language=fr-FR";

    let urlImage =
      "https://api.themoviedb.org/3/movie/" +
      id +
      "/images?api_key=e9d2c04b66ea46ff8dd8798d69c92134";

    axios
      .get(urlImage)
      .then((res) => {
        this.setState({
          bg:
            "https://image.tmdb.org/t/p/original" +
            res.data.backdrops[0].file_path,
        });
      })
      .catch((err) => {
        console.error(err);
      });
    await axios({
      url,
      method: "get",
      responseType: "json",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => {
        // console.log(res.data);
        const hours = parseInt(parseInt(res.data.runtime) / 60);
        const minutes = parseInt(parseInt(res.data.runtime) % 60);
        let dur = "";
        if (hours !== 0) {
          dur = hours + "h " + minutes + "min";
        } else {
          dur = minutes + "min";
        }

        res.data.genres.map((cat) => {
          this.state.cats2.forEach((element) => {
            if (element.name === cat.name) {
              element.checked = true;
              this.setState({ cats: [...this.state.cats.map(el => el.id), element.id]});
            } else if (!element.checked) {
              element.checked = false;
            }
          });
        });
        // console.log(this.state.cats);
        await this.setState({
          title: res.data.title,
          overview: res.data.overview,
          image: "https://image.tmdb.org/t/p/original" + res.data.poster_path,
          duration: dur,
          year: res.data.release_date.split("-")[0],
          categories: this.state.cats
            .filter((cat) => cat.checked)
            .map((cat) => cat.name),
          tags: res.data.tagline,
        });
        // console.log(this.state.tags);
      })
      .catch((err) => {
        console.error(err);
      });

    await this.getCast(id);
  };

  // get cast and crew
  getCast = async (id) => {
    let url =
      "https://api.themoviedb.org/3/movie/" +
      id +
      "/credits?api_key=e9d2c04b66ea46ff8dd8798d69c92134&&language=fr-FR";
    await axios({
      url: url,
      method: "get",
      responseType: "json",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then(async (res) => {
        //   console.log(res.data);
        res.data.cast.map((act) => (act.checked = false));
        res.data.crew.map((dir) => (dir.checked = false));

        await this.setState({
          actorsM: res.data.cast.map((actor) => actor),
          directorsM: res.data.crew
            .filter((dir) => dir.job === "Director")
            .map((dir) => dir),
        });
        // console.log(this.state.directors);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  
  

  selectAll = async (e, type) => {
    e.preventDefault();
    let deselectActor = true;
    this.state.actorsM.forEach((el) => {
      if (el.checked == false) {
        deselectActor = false;
      }
    });
    let deselectDirector = true;
    this.state.directorsM.forEach((el) => {
      if (el.checked == false) {
        deselectDirector = false;
      }
    });

    if (type === "actors") {
      if (deselectActor) {
        this.state.actorsM.forEach((el) => {
          el.checked = false;
        });
        let actors = [];
        await this.setState({ actorsM: this.state.actorsM, actors });
      } else {
        this.state.actorsM.forEach((el) => {
          el.checked = true;
        });
        let actors = this.state.actorsM.map((el) => el.name);
        await this.setState({ actorsM: this.state.actorsM, actors });
      }
    } else if (type === "directors") {
      if (deselectDirector) {
        this.state.directorsM.forEach((el) => {
          el.checked = false;
        });
        let directors = [];
        await this.setState({ directorsM: this.state.directorsM, directors });
      } else {
        this.state.directorsM.forEach((el) => {
          el.checked = true;
        });
        let directors = this.state.directorsM.map((el) => el.name);
        await this.setState({ directorsM: this.state.directorsM, directors });
      }
    }
  };

  componentDidMount() {
    const { token } = this.context;

    this.setState(
      {
        token: token,
      },
      () => this.fetchCats()
    );
  }

  render() {
    return (
      <div>
        <h1 className="text-2xl font-bold my-12 text-center">
          Ajouter un nouveau film
        </h1>

        <form action="" className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex gap-4 lg:flex-1 w-full   ">
              <input
                type="text"
                autoFocus
                placeholder="Le nom de film"
                className="w-full p-2 rounded-md border-2 focus:outline-none border-gray-300"
                value={this.state.name}
                onChange={(e) => this.setState({ name: e.target.value })}
              />
              <button
                className="bg-blue-800 py-2 px-4 rounded-md text-white font-bold"
                onClick={this.handleNameSearch}
              >
                Recherche
              </button>
            </div>

            <div className="flex gap-4 lg:flex-1 w-full">
              <input
                type="text"
                placeholder="IMDB ID"
                className="w-full p-2 rounded-md border-2 focus:outline-none border-gray-300"
                value={this.state.imdb}
                onChange={(e) => this.setState({ imdb: e.target.value })}
              />
              <button
                className="bg-blue-800 py-2 px-4 rounded-md text-white font-bold"
                onClick={this.handleImdbSearch}
              >
                Recherche
              </button>
            </div>
          </div>

          <div>
            <article className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
              {this.state.suggestions.length
                ? this.state.suggestions.map((suggestion) => (
                    <div
                      className="form-control border border-gray-300 rounded-md"
                      key={suggestion.id}
                    >
                      <label className="label cursor-pointer space-x-2">
                        <span className="label-text">
                          {suggestion.original_title} -{" "}
                          {suggestion.release_date}
                        </span>
                        <input
                          type="radio"
                          name="radio-6"
                          className="radio checked:bg-red-500"
                          onChange={() => this.handleMovieChange(suggestion.id)}
                        />
                      </label>
                    </div>
                  ))
                : null}
            </article>

            {this.state.totalPages > 1 ? (
              <div>
                <ul className="flex gap-4">
                  <li>
                    <button
                      className="py-2 px-4 rounded-md bg-blue-800 text-white"
                      onClick={(e) => {
                        e.preventDefault();
                        if (this.state.name !== "" && this.state.imdb === "") {
                          this.fetchSuggestionsByName(
                            this.state.page > 1 ? this.state.page - 1 : 1
                          );
                        } else {
                          this.fetchSuggestionsById(
                            this.state.page > 1 ? this.state.page - 1 : 1
                          );
                        }
                      }}
                    >
                      Previous
                    </button>
                  </li>
                  <li>
                    <button
                      className="py-2 px-4 rounded-md bg-blue-800 text-white"
                      disabled
                    >
                      {this.state.page}
                    </button>
                  </li>
                  <li>
                    <button
                      className="py-2 px-4 rounded-md bg-blue-800 text-white"
                      onClick={(e) => {
                        e.preventDefault();
                        //   console.log(e.target);

                        if (this.state.name !== "" && this.state.imdb === "") {
                          this.fetchSuggestionsByName(
                            this.state.page < this.state.totalPages
                              ? this.state.page + 1
                              : this.state.totalPages
                          );
                        } else {
                          this.fetchSuggestionsById(
                            this.state.page < this.state.totalPages
                              ? this.state.page + 1
                              : this.state.totalPages
                          );
                        }
                      }}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </div>
            ) : null}
          </div>

          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Titre du film"
              className="w-full p-2 rounded-md border-2 focus:outline-none border-gray-300"
              value={this.state.title}
              onChange={(e) => this.setState({ title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/*<input*/}
            {/*  type="text"*/}
            {/*  placeholder="Langue"*/}
            {/*  className="w-full p-2 rounded-md border-2 focus:outline-none border-gray-300"*/}
            {/*  value={this.state.language}*/}
            {/*  onChange={(e) => this.setState({ language: e.target.value })}*/}
            {/*/>*/}
            <div className="flex gap-4">
              <label className="label cursor-pointer space-x-2">
                <span className="label-text">VF</span>
                <input
                    type="checkbox"
                    checked={this.state.vf}
                    value={this.state.vf}
                    className="checkbox"
                    onChange={e => {
                      this.setState({ vf: e.target.checked });
                    }}
                />
              </label>

              <label className="label cursor-pointer space-x-2">
                <span className="label-text">VOSTFR</span>
                <input
                    type="checkbox"
                    checked={this.state.vostfr}
                    value={this.state.vostfr}
                    className="checkbox"
                    onChange={e => {
                      this.setState({ vostfr: e.target.checked });
                    }}
                />
              </label>
            </div>
            <input
              type="text"
              placeholder="Qualité"
              className="w-full p-2 rounded-md border-2 focus:outline-none border-gray-300 flex-1"
              value={this.state.quality}
              onChange={(e) => this.setState({ quality: e.target.value })}
            />
          </div>
          <div className="flex gap-4 flex-wrap">
            <textarea
              name=""
              id=""
              rows="10"
              className="p-2 rounded-md border-2 focus:outline-none border-gray-300 flex-grow"
              placeholder="description"
              value={this.state.overview}
              onChange={(e) => this.setState({ overview: e.target.value })}
            ></textarea>
            <img
              alt=""
              // width="400"
              id="poster"
              // style={{ maxHeight: 400 }}
              className="block w-full lg:w-1/4"
              src={this.state.image}
            />
          </div>

          <div className="flex gap-4 flex-wrap">
            <input
              type="text"
              className="p-2 rounded-md border-2 focus:outline-none border-gray-300 flex-grow"
              value={this.state.bg}
              placeholder="Image de fond"
              onChange={(e) => this.setState({ bg: e.target.value })}
            />
            <img
              alt=""
              id="poster"
              className="block w-fit"
              src={this.state.bg}
            />
          </div>

          <fieldset className="border-2 border-gray-300 rounded-md p-4 space-y-4">
            <legend className="text-xl font-semibold">
              Acteurs & Directeurs
            </legend>
            <h1 className="text-xl font-bold">Actors</h1>

            {this.state.actorsM.length ? (
              <button
                className="px-4 py-2 rounded-md bg-indigo-700 text-white font-semibold my-4"
                onClick={(e) => this.selectAll(e, "actors")}
              >
                Tout sélectionner
              </button>
            ) : null}

            <article className="flex gap-4 flex-wrap">
              {this.state.actorsM.length
                ? this.state.actorsM.map((actor) => (
                    <div
                      className="form-control  border border-gray-300 rounded-md"
                      key={actor.id}
                    >
                      <label className="label cursor-pointer space-x-2">
                        <span className="label-text">{actor.name}</span>
                        <input
                          type="checkbox"
                          checked={actor.checked}
                          value={actor.name}
                          onChange={(e) => {
                            if (!this.state.actors.includes(actor.name)) {
                              this.setState({
                                actors: [...this.state.actors, actor.name],
                              });
                              actor.checked = true;
                            } else {
                              this.setState({
                                actors: this.state.actors.filter(
                                  (act) => act != actor.name
                                ),
                              });
                              actor.checked = true;
                            }
                          }}
                          className="checkbox"
                        />
                      </label>
                    </div>
                  ))
                : null}
            </article>

            <h1 className="text-xl font-bold">Directeurs</h1>

            {this.state.directorsM.length ? (
              <button
                className="px-4 py-2 rounded-md bg-indigo-700 text-white font-semibold my-4"
                onClick={(e) => this.selectAll(e, "directors")}
              >
                Tout sélectionner
              </button>
            ) : null}

            <article className="flex gap-4 flex-wrap">
              {this.state.directorsM.length
                ? this.state.directorsM.map((director) => (
                    <div
                      className="form-control  border border-gray-300 rounded-md"
                      key={director.id}
                    >
                      <label className="label cursor-pointer space-x-2">
                        <span className="label-text">{director.name}</span>
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={director.checked}
                          value={director.name}
                          onChange={(e) => {
                            if (!this.state.directors.includes(director.name)) {
                              this.setState({
                                directors: [
                                  ...this.state.directors,
                                  director.name,
                                ],
                              });
                              director.checked = true;
                            } else {
                              this.setState({
                                directors: this.state.directors.filter(
                                  (dir) => dir != director.name
                                ),
                              });
                              director.checked = false;
                            }
                          }}
                        />
                      </label>
                    </div>
                  ))
                : null}
            </article>
          </fieldset>

          <div className="flex gap-4">
            <input
              type="text"
              placeholder="DATE DE SORTIE"
              className="w-full p-2 rounded-md border-2 focus:outline-none border-gray-300"
              value={this.state.year}
              onChange={(e) => this.setState({ year: e.target.value })}
            />
            <input
              type="text"
              placeholder="DURÉE"
              className="w-full p-2 rounded-md border-2 focus:outline-none border-gray-300"
              value={this.state.duration}
              onChange={(e) => this.setState({ duration: e.target.value })}
            />
          </div>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="ORIGINE"
              className="w-full p-2 rounded-md border-2 focus:outline-none border-gray-300"
              value={this.state.origin}
              onChange={(e) => this.setState({ origin: e.target.value })}
            />
            {/*<input*/}
            {/*  type="text"*/}
            {/*  placeholder="Symbol"*/}
            {/*  className="w-full p-2 rounded-md border-2 focus:outline-none border-gray-300"*/}
            {/*  value={this.state.symbol}*/}
            {/*  onChange={(e) => this.setState({ symbol: e.target.value })}*/}
            {/*/>*/}
          </div>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Mots clés"
              className="w-full p-2 rounded-md border-2 focus:outline-none border-gray-300"
              value={this.state.tags}
              onChange={(e) => this.setState({ tags: e.target.value })}
            />
          </div>

          <fieldset className="border-2 border-gray-300 rounded-md p-4">
            <legend className="text-xl font-semibold">Catégories</legend>
            <article className="flex gap-4 flex-wrap">
              {this.state.cats2
                ? this.state.cats2.map((category) => (
                    <div
                      className="form-control  border border-gray-300 rounded-md"
                      key={category.id}
                    >
                      <label className="label cursor-pointer space-x-2">
                        <span className="label-text">{category.name}</span>
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={category.checked}
                          value={category.id}
                          onChange={(e) => {
                            if (
                              !this.state.cats.includes(category.id)
                            ) {
                              this.setState(
                                {
                                  cats: [
                                    ...this.state.cats,
                                    category.id,
                                  ],
                                }
                              );
                              category.checked = true;
                            } else {
                              this.setState(
                                {
                                  cats: this.state.cats.filter(
                                    (cat) => cat != category.id
                                  ),
                                }
                              );
                              category.checked = false;
                            }
                          }}
                        />
                      </label>
                    </div>
                  ))
                : null}
            </article>
          </fieldset>


          <div className="space-y-4 my-4">
            <Error errors={this.state.errors} />
          </div>

          <button className="btn btn-accent" onClick={this.handleSubmit}>
            Ajouter
          </button>
        </form>
      </div>
    );
  }
}
