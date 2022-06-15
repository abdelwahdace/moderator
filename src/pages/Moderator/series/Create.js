import { Alert, AlertIcon } from "@chakra-ui/alert";
import axios from "axios";
import React, { Component } from "react";
import UserContext from "../../../Context/UserContext";

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
      tags: [],
      categoriesM: [],
      categories: [],
      cats: [],
      actorsM: [],
      actors: [],
      actor: "",
      directorsM: [],
      directors: [],
      director: "",
      errors: [],
      token: "",
      seasonNumber: 0,
      options: [],
      season: "",
      first: false,
      allowComments: false,
    };
  }

  fetchSuggestionsByName = async (page) => {
    if (this.state.name !== "") {
      let url =
        "https://api.themoviedb.org/3/search/tv?api_key=e9d2c04b66ea46ff8dd8798d69c92134&&language=fr-FR&query=" +
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
          // console.log(res.data);
          await this.setState({
            suggestions: res.data.tv_results,
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

  handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      title: `${this.state.title} Season ${this.state.season}`,
      origin: this.state.origin,
      year: this.state.year,
      img: this.state.image,
      actors: this.state.actors,
      categories: this.state.categories,
      directors: this.state.directors,
      description: this.state.overview,
      quality: this.state.quality,
      lang: this.state.language,
      season: parseInt(this.state.season),
      allow_comments: this.state.allowComments ? 1 : 0,
      is_first: this.state.start ? 1 : 0,
      is_approved: 0,
      tags: this.state.tags,
      type: "serie",
    };

    // console.log(data);
    // return null;

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
        // console.log(res);
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
          first: false,
          allowComments: false,
        });

        window.location.href = "/moderator/series";
      })
      .catch(async (err) => {
        // console.log(err.response);
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
    this.fetchSuggestionsById(1);
  };

  fetchCats = async () => {
    axios({
      url: "categories",
      method: "GET",
      responseType: "json",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // Authorization: "Bearer " + this.state.token,
      },
    })
      .then(async (res) => {
        await this.setState({
          cats: res.data,
        });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  handleSerieChange = async (id) => {
    let url =
      "https://api.themoviedb.org/3/tv/" +
      id +
      "?api_key=e9d2c04b66ea46ff8dd8798d69c92134&&language=fr-FR";

    

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
        res.data.genres.map((cat) => {
          this.state.cats.forEach((element) => {
            if (element.name === cat.name) {
              element.checked = true;
            } else if (!element.checked) {
              element.checked = false;
            }
          });
        });

        // console.log(this.state.cats);

        await this.setState({
          title: res.data.name,
          overview: res.data.overview,
          image: "https://image.tmdb.org/t/p/w500/" + res.data.poster_path,
          year: res.data.first_air_date.split("-")[0],
          categories: this.state.cats
            .filter((cat) => cat.checked)
            .map((cat) => cat.id),
          tags: res.data.tagline,
          origin: res.data.origin_country[0],
          language: res.data.original_language,
          seasonNumber: res.data.number_of_seasons,
        });
        this.createOptions();
      })
      .catch((err) => {
        console.error(err);
      });


      this.getCast(id);
      this.getTrailer(id);

    
  };

  // get cast and crew
  getCast = async (id) => {
    let url =
      "https://api.themoviedb.org/3/tv/" +
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
        res.data.cast.forEach((el) => {
          el.checked = false;
        });
        res.data.crew.forEach((el) => {
          el.checked = false;
        });
        await this.setState({
          actorsM: res.data.cast.map((actor) => actor),
          directorsM: res.data.crew
            .filter((dir) => dir.job === "Director")
            .map((dir) => dir),
        });
        // console.log(this.state.directorsM);
      })
      .catch((err) => {
        console.error(err);
      });
  };



  createOptions = async () => {
    this.setState({
      options: [],
    });
    for (let index = 0; index < this.state.seasonNumber; index++) {
      if (index == 0) {
        this.setState({
          season: 1,
        })
      }
      const s = "Season " + (index + 1);
      this.setState({
        options: [...this.state.options, s],
      });
    }
  };

  selectAll = async (e, type) => {
    e.preventDefault();
    if (type === "actors") {
      this.state.actorsM.forEach((el) => {
        el.checked = true;
      });
      let actors = this.state.actorsM.map((el) => el.name);
      await this.setState({ actorsM: this.state.actorsM, actors });
    } else if (type === "directors") {
      this.state.directorsM.forEach((el) => {
        el.checked = true;
      });
      let directors = this.state.directorsM.map((el) => el.name);
      await this.setState({ directorsM: this.state.directorsM, directors });
    }
  };

  componentDidMount() {
    const { token } = this.context;

    this.setState({
      token: token,
    });

    this.fetchCats();
  }

  render() {
    return (
      <div>
        <h1 className="text-2xl font-bold my-12 text-center">
          Ajouter un nouveau Serie
        </h1>

        <form action="" className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex gap-4 lg:flex-1 w-full   ">
              <input
                type="text"
                autoFocus
                placeholder="Le nom de série"
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

          {/* Display Suggestions */}
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
                          {suggestion.original_name} -{" "}
                          {suggestion.first_air_date
                            ? suggestion.first_air_date.split("-")[0]
                            : null}
                        </span>
                        <input
                          type="radio"
                          name="radio-6"
                          className="radio checked:bg-red-500"
                          onChange={() => this.handleSerieChange(suggestion.id)}
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
                        this.fetchSuggestions(
                          this.state.page > 1 ? this.state.page - 1 : 1
                        );
                      }}
                    >
                      Précédent
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
                        this.fetchSuggestions(
                          this.state.page < this.state.totalPages
                            ? this.state.page + 1
                            : this.state.totalPages
                        );
                      }}
                    >
                      Suivant
                    </button>
                  </li>
                </ul>
              </div>
            ) : null}
          </div>

          {/* End Suggestions */}

          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Titre du série"
              className="w-full p-2 rounded-md border-2 focus:outline-none border-gray-300"
              value={this.state.title}
              onChange={(e) => this.setState({ title: e.target.value })}
            />
            <select
              className="w-full p-2 rounded-md border-2 focus:outline-none border-gray-300"
              onChange={(e) => this.setState({ season: e.target.value })}
            >
              <option disabled selected>Selectionez le season</option>
              {this.state.options.length
                ? this.state.options.map((opt, i) => (
                    <option value={i + 1}>{opt}</option>
                  ))
                : null}
            </select>
          </div>
          <fieldset className="border-2 border-gray-300 rounded-md p-4">
            <legend className="text-xl font-semibold">Actions</legend>

            <article className="flex flex-wrap gap-4">
              {/*  is first */}
              <label className="label cursor-pointer space-x-2">
                <span className="label-text">Afficher En Premier</span>
                <input
                    type="checkbox"
                    checked={this.state.first}
                    value={this.state.first}
                    className="checkbox"
                    onChange={e => {
                      this.setState({ first: e.target.checked });
                    }}
                />
              </label>

              {/*  approved */}
              <label className="label cursor-pointer space-x-2">
                <span className="label-text">Autoriser les commentaires</span>
                <input
                    type="checkbox"
                    checked={this.state.allowComments}
                    value={this.state.allowComments}
                    className="checkbox"
                    onChange={e => {
                      this.setState({ allowComments: e.target.checked });
                    }}
                />
              </label>
            </article>
          </fieldset>

          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Langue"
              className="w-full p-2 rounded-md border-2 focus:outline-none border-gray-300"
              value={this.state.language}
              onChange={(e) => this.setState({ language: e.target.value })}
            />
            <input
              type="text"
              placeholder="Qualité"
              className="w-full p-2 rounded-md border-2 focus:outline-none border-gray-300"
              value={this.state.quality}
              onChange={(e) => this.setState({ quality: e.target.value })}
            />
          </div>
          <div className="flex gap-4 flex-wrap">
            <textarea
              rows="10"
              className="p-2 rounded-md border-2 focus:outline-none border-gray-300 flex-grow"
              placeholder="description"
              value={this.state.overview}
              onChange={(e) => this.setState({ overview: e.target.value })}
            ></textarea>
            <img
              alt=""
              width="400"
              id="poster"
              style={{ maxHeight: 400 }}
              className="block"
              src={this.state.image}
            />
          </div>

          <fieldset className="border-2 border-gray-300 rounded-md p-4 space-y-4">
            <legend className="text-xl font-semibold">
              Acteurs & Directeurs
            </legend>
            <h1 className="text-xl font-bold">Acteurs</h1>
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
                              actor.checked = false;
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
                            } else {
                              this.setState({
                                directors: this.state.directors.filter(
                                  (dir) => dir != director.name
                                ),
                              });
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
              placeholder="ORIGINE"
              className="w-full p-2 rounded-md border-2 focus:outline-none border-gray-300"
              value={this.state.origin}
              onChange={(e) => this.setState({ origin: e.target.value })}
            />
          </div>

          <fieldset className="border-2 border-gray-300 rounded-md p-4">
            <legend className="text-xl font-semibold">Catégories</legend>
            <article className="flex gap-4 flex-wrap">
              {this.state.cats
                ? this.state.cats.map((category) => (
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
                          value={category.name}
                          onChange={(e) => {
                            if (
                              !this.state.categories.includes(category.id)
                            ) {
                              this.setState({
                                categories: [
                                  ...this.state.categories,
                                  category.id,
                                ],
                              });
                              category.checked = true;
                            } else {
                              this.setState({
                                categories: this.state.categories.filter(
                                  (cat) => cat != category.id
                                ),
                              });
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
            {this.state.errors.length
              ? this.state.errors.map((error) => (
                  <Alert status="error" className="rounded-md" key={error}>
                    <AlertIcon />
                    {error}
                  </Alert>
                ))
              : null}
          </div>

          <button className="btn btn-accent" onClick={this.handleSubmit}>
            Ajouter
          </button>
        </form>
      </div>
    );
  }
}
