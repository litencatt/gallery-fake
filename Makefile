run:
	docker compose run app bash

tag:
	git tag ${NEXT_VER} | true
	git push origin ${NEXT_VER}
